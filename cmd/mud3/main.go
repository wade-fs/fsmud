package main

import (
	"bufio"
	"fmt"
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

// 新增變數
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

// 創建房間
func createRoom(name, desc string) *LPCObject {
	room := &LPCObject{
		Name:    name,
		Props:   map[string]string{"description": desc},
		Methods: make(map[string]func(*LPCObject, string) string),
	}

	// 設定 "look" 方法
	room.Methods["look"] = func(obj *LPCObject, _ string) string {
		return obj.Props["description"]
	}

	return room
}

//////////////////////////////////////////////////////////////////////////////
// 玩家系統
//////////////////////////////////////////////////////////////////////////////

type Player struct {
	Name      string
	Location *LPCObject
	conn     net.Conn
}

//////////////////////////////////////////////////////////////////////////////
// 互動區

// 處理玩家輸入
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

var rooms = make(map[string]*LPCObject)
var players = make(map[string]*Player)
var mutex sync.Mutex

func initRooms() {
	start := createRoom("開始之地", "這是一個小房間，四周都是石牆。")
	forest := createRoom("森林", "你來到一片茂密的森林。")

	// 設定房間出口
	start.SetProp("north", "forest")
	forest.SetProp("south", "start")

	rooms["start"] = start
	rooms["forest"] = forest
}

func movePlayer(player *Player, direction string) string {
	if newRoomName, exists := player.Location.Props[direction]; exists {
		if newRoom, ok := rooms[newRoomName]; ok {
			player.Location = newRoom
			return "你移動到了 " + newRoom.Name
		}
	}
	return "你不能往這個方向移動。"
}

// 用來控制玩家發呆太久的處置，譬如斷線(踢出)
const timeoutDuration = 5 * time.Minute

func handlePlayer(conn net.Conn) {
	defer conn.Close()

	// 建立玩家
	player := &Player{
		Name:     "玩家",
		Location: rooms["start"],
		conn:     conn,
	}

	mutex.Lock()
	players[conn.RemoteAddr().String()] = player
	mutex.Unlock()

	// 設置超時控制
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
				// 重新開始計時
			}
		}
	}()

	conn.Write([]byte(`歡迎來到 MUD 世界！輸入 'look' 查看，'quit' 退出。
> `))

	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		input := strings.TrimSpace(scanner.Text())

		// 玩家輸入時重置超時
		select {
		case timeoutCh <- true:
		default:
		}

		response := processCommand(player, input)

		// 若玩家選擇離開，直接終止
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
	initRooms()

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

