package main

import (
	"bufio"
	"encoding/json"
    "fmt"
    "io/ioutil"
    "log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
    "sync"

    v8 "fsmud/utils/v8go"
	"github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
)

var (
    iso          = v8.NewIsolate()
    ctx          *v8.Context
    clients      = make(map[interface{}]struct{ Conn interface{}; Room string; PlayerID string })
    clientsMu    sync.Mutex
    upgrader     = websocket.Upgrader{
        ReadBufferSize:  1024,
        WriteBufferSize: 1024,
        CheckOrigin: func(r *http.Request) bool { return true },
    }
)

func listFiles(dir string, ext string) []string {
    var files []string
	dir = filepath.Join("domain", dir)
    err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        if !info.IsDir() && strings.HasSuffix(info.Name(), ext) {
            relPath, _ := filepath.Rel(dir, path)
            name := strings.TrimSuffix(relPath, ext)
            files = append(files, name)
        }
        return nil
    })
    if err != nil {
        log.Printf("Error walking directory %s: %v", dir, err)
    }
    return files
}

func broadcastMessage(msg string, room string, isGlobal bool, excludePlayerID string) {
	clientsMu.Lock()
	defer clientsMu.Unlock()
	for client, info := range clients {
		if isGlobal || (room != "" && info.Room == room) {
			if excludePlayerID == "" || info.PlayerID != excludePlayerID { // Skip the sender
				switch c := client.(type) {
				case *websocket.Conn:
					if err := c.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
						log.Printf("WebSocket write error: %v", err)
					}
				case net.Conn:
					if _, err := fmt.Fprintf(c, "%s\r\n", msg); err != nil {
						log.Printf("Telnet write error: %v", err)
					}
				}
			}
		}
	}
}

// 初始化 V8 並載入 mudlib
func initV8() {
    global := v8.NewObjectTemplate(iso)

	global.Set("log", v8.NewFunctionTemplate(iso, cb_log))
    global.Set("loadFile", v8.NewFunctionTemplate(iso, cb_loadFile))
    global.Set("saveFile", v8.NewFunctionTemplate(iso, cb_saveFile))
    global.Set("broadcastToRoom", v8.NewFunctionTemplate(iso, cb_broadcastToRoom))
    global.Set("broadcastGlobal", v8.NewFunctionTemplate(iso, cb_broadcastGlobal))
    global.Set("shutdown", v8.NewFunctionTemplate(iso, cb_shutdown))
	global.Set("setInterval", v8.NewFunctionTemplate(iso, cb_setInterval))
    global.Set("clearInterval", v8.NewFunctionTemplate(iso, cb_clearInterval))

    ctx = v8.NewContext(iso, global)

    roomFiles := listFiles("rooms", ".json")
    npcFiles := listFiles("npcs", ".json")
    itemFiles := listFiles("items", ".json")
    cmdFiles := listFiles("cmds", ".js")
    playerFiles := listFiles("players", ".json")

    filesJSON := map[string][]string{
        "rooms":   roomFiles,
        "npcs":    npcFiles,
        "items":   itemFiles,
        "cmds": cmdFiles,
        "players": playerFiles,
    }

    filesJSONBytes, err := json.Marshal(filesJSON)
    if err != nil {
        log.Fatal("Failed to marshal file lists:", err)
    }
    filesVal, err := v8.JSONParse(ctx, string(filesJSONBytes))
    if err != nil {
        log.Fatal("Failed to parse file lists JSON:", err)
    }
    ctx.Global().Set("fileLists", filesVal)

    mudlibFiles := []string{
        "domain/cache.js",
        "domain/i18n.js",
        "domain/objects.js",
        "domain/player.js",
        "domain/weather.js",
        "domain/combat.js",
        "domain/commands.js",
        "domain/mudlib.js",
    }

    for _, file := range mudlibFiles {
        scriptBytes, err := ioutil.ReadFile(file)
        if err != nil {
            log.Fatalf("Failed to load %s: %v", file, err)
        }
        if _, err := ctx.RunScript(string(scriptBytes), file); err != nil {
            log.Fatalf("Failed to execute %s: %v", file, err)
        }
    }

    for _, cmd := range cmdFiles {
        scriptBytes, err := ioutil.ReadFile(fmt.Sprintf("domain/cmds/%s.js", cmd))
        if err != nil {
            log.Printf("Failed to load player cmd %s.js: %v", cmd, err)
            continue
        }
        script := fmt.Sprintf("this.%s = %s", cmd, string(scriptBytes))
        if _, err := ctx.RunScript(script, fmt.Sprintf("%s.js", cmd)); err != nil {
            log.Printf("Failed to execute player cmd %s.js: %v", cmd, err)
        }
    }
}

// WebSocket 處理
func handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Println("WebSocket upgrade failed:", err)
        return
    }
    defer conn.Close()

    clientsMu.Lock()
    playerID := fmt.Sprintf("player_%d", len(clients)+1)
    clients[conn] = struct{ Conn interface{}; Room string; PlayerID string }{
		Conn: conn,
		Room: "entrance",
		PlayerID: playerID }
    clientsMu.Unlock()

    conn.WriteMessage(websocket.TextMessage, []byte("Please enter your username:"))

    for {
        _, message, err := conn.ReadMessage()
        if err != nil {
            clientsMu.Lock()
            delete(clients, conn)
            clientsMu.Unlock()
            ctx.RunScript(fmt.Sprintf("removePlayer('%s')", playerID), "cleanup.js")
            return
        }

        cmd := string(message)
        script := fmt.Sprintf(`processCommand("%s", "%s")`, playerID, cmd)
        val, err := ctx.RunScript(script, "cmd.js")
        if err != nil {
            conn.WriteMessage(websocket.TextMessage, []byte("Error: "+err.Error()))
        } else {
            conn.WriteMessage(websocket.TextMessage, []byte(val.String()))
        }

        // 查詢玩家房間並更新
        roomScript := fmt.Sprintf("players['%s'] ? players['%s'].room : 'entrance'", playerID, playerID)
        roomVal, err := ctx.RunScript(roomScript, "get_room.js")
        if err == nil && roomVal.IsString() {
            clientsMu.Lock()
            clients[conn] = struct{ Conn interface{}; Room string; PlayerID string }{Conn: conn, Room: roomVal.String(), PlayerID:playerID}
            clientsMu.Unlock()
        }
    }
}

// Telnet 處理
func handleTelnet(conn net.Conn) {
	defer conn.Close()

    clientsMu.Lock()
    playerID := fmt.Sprintf("player_%d", len(clients)+1)
    clients[conn] = struct{ Conn interface{}; Room string; PlayerID string }{Conn: conn, Room: "entrance", PlayerID: playerID}
    clientsMu.Unlock()

    fmt.Fprintf(conn, "Please enter your username:\r\n> ")

    scanner := bufio.NewScanner(conn)
    for scanner.Scan() {
        cmd := strings.TrimSpace(scanner.Text())
        if cmd == "quit" {
            clientsMu.Lock()
            delete(clients, conn)
            clientsMu.Unlock()
            ctx.RunScript(fmt.Sprintf("removePlayer('%s')", playerID), "cleanup.js")
            return
        }

        script := fmt.Sprintf(`processCommand("%s", "%s")`, playerID, cmd)
        val, err := ctx.RunScript(script, "cmd.js")
        if err != nil {
            fmt.Fprintf(conn, "Error: %s\r\n> ", err.Error())
        } else {
            fmt.Fprintf(conn, "%s\r\n> ", val.String())
        }

        // 查詢玩家房間並更新
        roomScript := fmt.Sprintf("players['%s'] ? players['%s'].room : 'entrance'", playerID, playerID)
        roomVal, err := ctx.RunScript(roomScript, "get_room.js")
        if err == nil && roomVal.IsString() {
            clientsMu.Lock()
            clients[conn] = struct{ Conn interface{}; Room string; PlayerID string}{Conn: conn, Room: roomVal.String(), PlayerID: playerID }
            clientsMu.Unlock()
        }
    }

    if err := scanner.Err(); err != nil {
        log.Println("Telnet read error:", err)
        clientsMu.Lock()
        delete(clients, conn)
        clientsMu.Unlock()
        ctx.RunScript(fmt.Sprintf("removePlayer('%s')", playerID), "cleanup.js")
    }
}

// 啟動 Telnet 伺服器
func startTelnetServer() {
    listener, err := net.Listen("tcp", ":2323") // 使用 2323 端口，避免與系統預設 Telnet 衝突
    if err != nil {
        log.Fatal("Telnet server failed:", err)
    }
    log.Println("Telnet server started at :2323")
	defer listener.Close()

    for {
        select {
        case <-shutdownChan:
            return
        default:
            conn, err := listener.Accept()
            if err != nil {
                log.Println("Telnet accept error:", err)
                continue
            }
            go handleTelnet(conn)
        }
    }
}

func main() {
    initV8()
    r := gin.Default()

    // 設定靜態文件路由
    r.Static("/domain/static", "./domain/static")

    // 提供首頁
    r.GET("/", func(c *gin.Context) {
        c.File("./domain/static/index.html")
    })

    // WebSocket 路由
    r.GET("/ws", handleWebSocket)
    go r.Run(":8080")
	go startTelnetServer()

	<-shutdownChan
    log.Println("Server started at :8080")
	os.Exit(0)
}
