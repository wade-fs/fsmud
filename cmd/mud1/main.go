package main

import (
	"bufio"
	"fmt"
	"net"
	"strings"
)

// 處理玩家的連線
func handleConnection(conn net.Conn) {
	defer conn.Close()

	// 發送歡迎訊息
	conn.Write([]byte("歡迎來到 Go MUD！請輸入指令：\n"))

	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		input := strings.TrimSpace(scanner.Text())

		if input == "quit" {
			conn.Write([]byte("再見！\n"))
			break
		}

		// 處理指令
		response := processCommand(input)
		conn.Write([]byte(response + "\n"))
	}

	fmt.Println("玩家離線")
}

// 處理玩家輸入的指令
func processCommand(cmd string) string {
	switch cmd {
	case "look":
		return "你看到一個簡單的房間。"
	case "go north":
		return "你往北走了。"
	default:
		return "未知指令。"
	}
}

func main() {
	listener, err := net.Listen("tcp", ":4000")
	if err != nil {
		fmt.Println("無法啟動伺服器：", err)
		return
	}
	defer listener.Close()

	fmt.Println("MUD 伺服器啟動！請用 telnet 連線到 port 4000")

	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("連線錯誤：", err)
			continue
		}
		go handleConnection(conn)
	}
}

