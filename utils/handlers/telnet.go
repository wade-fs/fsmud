// cmd/mud/handlers/telnet.go

package handlers

import (
	"bufio"
	"fmt"
	"fsmud/utils/client"
	"fsmud/utils/v8funcs"
	"fsmud/utils/v8go"
	"log"
	"net"
	"strings"
)

func StartTelnetServer(m *client.ClientManager, ctx *v8go.Context) {
	listener, err := net.Listen("tcp", ":2323")
	if err != nil {
		log.Fatal("Telnet server failed:", err)
	}
	log.Println("Telnet server started at :2323")
	defer listener.Close()

	for {
		select {
		case <-v8funcs.ShutdownChan:
			return
		default:
			conn, err := listener.Accept()
			if err != nil {
				log.Println("Telnet accept error:", err)
				continue
			}
			go handleTelnet(conn, m, ctx)
		}
	}
}

func handleTelnet(conn net.Conn, m *client.ClientManager, ctx *v8go.Context) {
	defer conn.Close()

	playerID := m.GeneratePlayerID()
	m.Add(conn, "character creation", "telnet")
	fmt.Fprintf(conn, "Welcome to the MUD!\r\nPlease login or create with: <username> <password>\r\n> ")

	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		input := strings.TrimSpace(scanner.Text())
		info, exists := m.Get(conn)
		if !exists {
			continue
		}

		// 將所有輸入交給 V8 的 processCommand 處理
		script := fmt.Sprintf(`processCommand("%s", "%s")`, info.PlayerID, input)
		val, err := ctx.RunScript(script, "cmd.js")
		if err != nil {
			fmt.Fprintf(conn, "Error: %s\r\n> ", err.Error())
			e := err.(*v8go.JSError)
			fmt.Println(e.Message)
			fmt.Println(e.Location)
			fmt.Println(e.StackTrace)
			fmt.Printf("javascript error: %v", e)
			fmt.Printf("javascript stack trace: %+v", e)
			continue
		}

		// 處理回傳結果
		result := val.String()
		if result != "" && result != "undefined" {
			fmt.Fprintf(conn, "%s\r\n> ", result)
		} else {
			fmt.Fprintf(conn, "> ") // 保持提示符
		}

		// 更新房間資訊（由 V8 控制）
		areaScript := fmt.Sprintf(`players["%s"] ? players["%s"].area : "character creation"`, info.PlayerID, info.PlayerID)
		areaVal, err := ctx.RunScript(areaScript, "get_area.js")
		if err == nil && areaVal.IsString() {
			m.UpdateRoom(conn, areaVal.String())
		}

		// 如果收到 quit，清理並退出
		if input == "quit" {
			_,err := ctx.RunScript(fmt.Sprintf(`removePlayer("%s")`, info.PlayerID), "cleanup.js")
			if err != nil {
				fmt.Fprintf(conn, "Error: %s\r\n> ", err.Error())
				e := err.(*v8go.JSError)
				fmt.Println(e.Message)
				fmt.Println(e.Location)
				fmt.Println(e.StackTrace)
				fmt.Printf("javascript error: %v", e)
				fmt.Printf("javascript stack trace: %+v", e)
			}
			m.Remove(conn)
			return
		}
	}
	if err := scanner.Err(); err != nil {
		log.Println("Telnet read error:", err)
		m.Remove(conn)
		_, err := ctx.RunScript(fmt.Sprintf(`removePlayer("%s")`, playerID), "cleanup.js")
		if err != nil {
			fmt.Fprintf(conn, "Error: %s\r\n> ", err.Error())
			e := err.(*v8go.JSError)
			fmt.Println(e.Message)
			fmt.Println(e.Location)
			fmt.Println(e.StackTrace)
			fmt.Printf("javascript error: %v", e)
			fmt.Printf("javascript stack trace: %+v", e)
		}
	}
}
