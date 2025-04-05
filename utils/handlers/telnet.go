// cmd/mud/handlers/telnet.go

package handlers

import (
	"bufio"
	"fmt"
	"fsmud/utils/client"
	"fsmud/utils/v8funcs"
	"fsmud/utils/v8go"
	"html/template"
	"log"
	"net"
	"strings"
	"sync"
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

	var history []string
	var historyIndex int
	var historyMutex sync.Mutex

	playerID := m.GeneratePlayerID()
	m.Add(conn, "character creation", "telnet")
	fmt.Fprintf(conn, "Welcome to the MUD!\r\nPlease login or create with: <username> <password>\r\n> ")

	// 讓客戶端進入 Raw Mode
	conn.Write([]byte{255, 251, 1})  // IAC WILL ECHO
	conn.Write([]byte{255, 251, 3})  // IAC WILL SUPPRESS GO AHEAD
	conn.Write([]byte{255, 252, 34}) // IAC WONT LINEMODE

	reader := bufio.NewReader(conn)
	var inputBuffer []rune

	for {
		char, err := reader.ReadByte()
		if err != nil {
			return
		}

		if char == 255 { // IAC byte
			next, _ := reader.ReadByte()
			if next == 251 || next == 252 || next == 253 || next == 254 { // WILL, WONT, DO, DONT
				reader.ReadByte() // 跳過選項 byte
			}
			continue
		}
		if char == 13 { // ENTER 鍵
			info, exists := m.Get(conn)
			if !exists {
				continue
			}

			_input := strings.TrimSpace(string(inputBuffer))
			if _input != "" {
				historyMutex.Lock()
				history = append(history, _input)
				historyIndex = len(history)
				historyMutex.Unlock()
			}

			input := template.JSEscapeString(strings.TrimSpace(string(_input)))
			script := fmt.Sprintf(`processCommand("%s", "%s")`, info.PlayerID, input)
        	fmt.Printf("Run V8: '%s'\n", script)
			val, err := ctx.RunScript(script, "cmd.js")
			if err != nil {
				conn.Write([]byte("Error processing command\n"))
			} else {
				msg := "\r\n"+strings.ReplaceAll(val.String(), "\n", "\r\n")+"\r\n"
				conn.Write([]byte(msg))
			}

			inputBuffer = nil // 清空輸入緩衝區
			conn.Write([]byte("> "))
			continue
		}

		if char == '\x7F' {
		    if len(inputBuffer) > 0 {
		        inputBuffer = inputBuffer[:len(inputBuffer)-1]
		        conn.Write([]byte("\b\033[K"))
		    }
		    continue
		}

		if char == 27 { // 方向鍵 (Escape sequence)
			next, _ := reader.ReadByte()
			if next == 91 {
				direction, _ := reader.ReadByte()
				if direction == 65 { // 向上鍵 (History Up)
					historyMutex.Lock()
					if historyIndex > 0 {
						historyIndex--
					}
					if historyIndex < len(history) {
						inputBuffer = []rune(history[historyIndex])
					}
					historyMutex.Unlock()
				} else if direction == 66 { // 向下鍵 (History Down)
					historyMutex.Lock()
					if historyIndex < len(history)-1 {
						historyIndex++
						inputBuffer = []rune(history[historyIndex])
					} else {
						historyIndex = len(history)
						inputBuffer = nil
					}
					historyMutex.Unlock()
				}
				conn.Write([]byte("\r> " + string(inputBuffer) + " \033[K")) // 清除行並顯示歷史命令
			}
			continue
		}

		if char >= 32 && char <= 126 {
			inputBuffer = append(inputBuffer, rune(char))
			conn.Write([]byte{char})
		} else {
			log.Println([]byte{char})
			ctx.RunScript(fmt.Sprintf(`removePlayer("%s")`, playerID), "cleanup.js")
		}
	}
}
