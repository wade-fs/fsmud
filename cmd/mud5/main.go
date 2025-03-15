package main

import (
	"bufio"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"fsmud/utils/obj"
)

type LPCObject struct {
	Name    string
	Props   map[string]string
	Methods map[string]func(*LPCObject, string) string
}

func (obj *LPCObject) SetProp(key, value string) {
	obj.Props[key] = value
}

func (obj *LPCObject) GetProp(key string) string {
	return obj.Props[key]
}

func (obj *LPCObject) CallMethod(method string, param string) string {
	if fn, ok := obj.Methods[method]; ok {
		return fn(obj, param)
	}
	return "未知的方法: " + method
}

func loadRoomsFromScripts() {
    loader := obj.NewObjectLoader()
    err := loader.LoadJSONTree("rooms")
    if err != nil {
        fmt.Println("無法載入房間資料:", err)
        return
    }

    // 輸出載入的房間資料以進行調試
    jsonStr, err := loader.Dump("  ")
    if err != nil {
        fmt.Println("無法輸出房間資料:", err)
        return
    }
    fmt.Println("載入的房間資料：", jsonStr)

    // 直接訪問 loader.data，獲取房間資料
    roomsData, ok := loader.GetData().(map[string]interface{})
    if !ok {
        fmt.Println("錯誤: 無法解析房間資料")
        return
    }

    // 遍歷房間資料
    for fileName, roomData := range roomsData {
        cleanFileName := strings.TrimSuffix(fileName, ".json")
        if roomMap, ok := roomData.(map[string]interface{}); ok {
            // 從 JSON 中獲取房間名稱
            roomName, ok := roomMap["name"].(string)
            if !ok || roomName == "" {
                fmt.Println("警告: 文件", cleanFileName, "缺少有效的房間名稱")
                continue
            }

            // 使用 JSON 中的 name 作為房間名稱
            room := convertToLPCObject(roomName, roomMap)
            if room != nil {
                rooms[roomName] = room
                fmt.Println("載入房間:", roomName, "(文件:", cleanFileName, ")")
            } else {
                fmt.Println("警告: 無法轉換房間:", roomName, "(文件:", cleanFileName, ")")
            }
        } else {
            fmt.Println("警告: 文件", cleanFileName, "的資料格式無效")
        }
    }

    // 列出所有載入的房間
    fmt.Println("所有載入的房間：")
    for roomName := range rooms {
        fmt.Println(" -", roomName)
    }

    // 檢查是否成功載入起始房間
    startRoomName := "開始之地" // 使用 JSON 中的 name
    if _, exists := rooms[startRoomName]; !exists {
        fmt.Println("錯誤: 未找到起始房間 '", startRoomName, "'")
    } else {
        fmt.Println("成功載入起始房間 '", startRoomName, "'")
    }
}

func convertToLPCObject(name string, data map[string]interface{}) *LPCObject {
    props := make(map[string]string)
    methods := make(map[string]func(*LPCObject, string) string)

    // 設置名稱
    room := &LPCObject{
        Name:    name,
        Props:   props,
        Methods: methods,
    }

    // 設置描述
    if desc, ok := data["description"].(string); ok {
        room.SetProp("description", desc)
    } else {
        fmt.Println("警告: 房間", name, "沒有描述")
        return nil
    }

    // 設置出口
    if exits, ok := data["exits"].(map[string]interface{}); ok {
        for dir, roomName := range exits {
            if roomNameStr, ok := roomName.(string); ok {
                room.SetProp(dir, roomNameStr)
            }
        }
    }

    // 設置 look 方法
    room.Methods["look"] = func(obj *LPCObject, _ string) string {
        desc := obj.Props["description"]
        var exits []string
        for dir, roomName := range obj.Props {
            if dir != "description" && roomName != "" {
                exits = append(exits, dir+" -> "+roomName)
            }
        }
        if len(exits) > 0 {
            desc += "\n出口: " + strings.Join(exits, ", ")
        }
        return desc
    }

    return room
}

type Player struct {
	Name     string
	Location *LPCObject
	conn     net.Conn
}
var rooms = make(map[string]*LPCObject)
var players = make(map[string]*Player)
var mutex sync.Mutex
func movePlayer(player *Player, direction string) string {
	if newRoomName, exists := player.Location.Props[direction]; exists {
		if newRoom, ok := rooms[newRoomName]; ok {
			player.Location = newRoom
			return "你移動到了 " + newRoom.Name
		}
	}
	return "你不能往這個方向移動。"
}
func processCommand(player *Player, input string) string {
	args := strings.SplitN(input, " ", 2)
	if len(args) == 0 {
		return "請輸入指令。"
	}

	command := strings.ToLower(args[0])
	argument := ""
	if len(args) > 1 {
		argument = args[1]
	}

	switch command {
	case "look":
		return player.Location.CallMethod("look", "")
	case "go":
		if argument == "" {
			return "請指定一個方向，例如: go north"
		}
		return movePlayer(player, argument)
	case "say":
		return fmt.Sprintf("%s 說: %s", player.Name, argument)
	case "quit":
		player.conn.Write([]byte("再見！\n"))
		player.conn.Close()
		return "離開遊戲..."
	default:
		return "未知的指令: " + command
	}
}
const timeoutDuration = 5 * time.Minute
func handlePlayer(conn net.Conn) {
	defer conn.Close()
	player := &Player{
		Name:     "玩家",
		Location: rooms["開始之地"],
		conn:     conn,
	}
	mutex.Lock()
	players[conn.RemoteAddr().String()] = player
	mutex.Unlock()
	timeoutCh := make(chan bool, 1)
	go func() {
		for {
			select {
			case <-time.After(timeoutDuration):
				player.conn.Write([]byte("你發呆太久，被踢出遊戲。\n"))
				player.conn.Close()
				mutex.Lock()
				delete(players, conn.RemoteAddr().String())
				mutex.Unlock()
				return
			case <-timeoutCh:
			}
		}
	}()
	conn.Write([]byte("歡迎來到 MUD 世界！輸入 'look' 查看，'quit' 退出。\n > "))
	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		input := strings.TrimSpace(scanner.Text())
		select {
		case timeoutCh <- true:
		default:
		}
		response := processCommand(player, input)
		if response == "離開遊戲..." {
			break
		}
		conn.Write([]byte(response + "\n> "))
	}
	fmt.Println("玩家離開: ", conn.RemoteAddr())
	mutex.Lock()
	delete(players, conn.RemoteAddr().String())
	mutex.Unlock()
}
func main() {
	loadRoomsFromScripts()
	listener, err := net.Listen("tcp", "0.0.0.0:4000")
	if err != nil {
		fmt.Println("無法啟動伺服器:", err)
		return
	}
	defer listener.Close()
	fmt.Println("MUD 伺服器啟動，等待連線...")
	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("連線失敗:", err)
			continue
		}
		go handlePlayer(conn)
	}
}

