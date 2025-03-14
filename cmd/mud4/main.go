package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"net"
	"strings"
	"sync"
	"time"
)

//////////////////////////////////////////////////////////////////////////////
// LPC area

// 記錄 LPC 物件
type LPCObject struct {
	Name    string
	Props   map[string]string
	Methods map[string]func(*LPCObject, string) string
}

// 設定變數
func (obj *LPCObject) SetProp(key, value string) {
	obj.Props[key] = value
}

func (obj *LPCObject) GetProp(key string) string {
	return obj.Props[key]
}

// 呼叫方法
func (obj *LPCObject) CallMethod(method string, param string) string {
	if fn, ok := obj.Methods[method]; ok {
		return fn(obj, param)
	}
	return "未知的方法: " + method
}

// 解析 LPC 腳本
func parseLPCScript(filePath string) *LPCObject {
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Println("無法讀取檔案:", filePath, err)
		return nil
	}

	lines := strings.Split(string(data), "\n")
	var name, desc string
	props := make(map[string]string)

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "//") {
			continue // 忽略空行和註解
		}
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		switch key {
		case "name":
			name = value
		case "description":
			desc = value
		case "exits":
			// 解析出口，例如 "north:森林小徑,east:村莊廣場"
			exits := strings.Split(value, ",")
			for _, exit := range exits {
				exitParts := strings.SplitN(exit, ":", 2)
				if len(exitParts) == 2 {
					exitDir := strings.TrimSpace(exitParts[0])
					exitRoom := strings.TrimSpace(exitParts[1])
					props[exitDir] = exitRoom
				}
			}
		default:
			props[key] = value
		}
	}

	if name == "" {
		fmt.Println("警告: 檔案", filePath, "沒有房間名稱")
		return nil
	}

	room := &LPCObject{
		Name:    name,
		Props:   props,
		Methods: make(map[string]func(*LPCObject, string) string),
	}

	room.SetProp("description", desc)

	// 設定 "look" 方法
	room.Methods["look"] = func(obj *LPCObject, _ string) string {
		// 顯示房間描述和出口
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

// 讀取 rooms/ 目錄中的所有 LPC 腳本
func loadRoomsFromScripts() {
	files, err := ioutil.ReadDir("rooms")
	if err != nil {
		fmt.Println("無法讀取 rooms 目錄:", err)
		return
	}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".c") {
			filePath := "rooms/" + file.Name()
			room := parseLPCScript(filePath)
			if room != nil {
				rooms[room.Name] = room
				fmt.Println("載入房間:", room.Name)
			}
		}
	}
}

//////////////////////////////////////////////////////////////////////////////
// 玩家系統

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

//////////////////////////////////////////////////////////////////////////////
// 伺服器處理

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

	conn.Write([]byte(`歡迎來到 MUD 世界！輸入 'look' 查看，'quit' 退出。
> `))

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

