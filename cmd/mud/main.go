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
	"time"

    v8 "fsmud/utils/v8go"
	"github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
)

var (
    iso          = v8.NewIsolate()
    ctx          *v8.Context
    clients      = make(map[interface{}]struct{ Conn interface{}; Room string })
    clientsMu    sync.Mutex
    upgrader     = websocket.Upgrader{
        ReadBufferSize:  1024,
        WriteBufferSize: 1024,
        CheckOrigin: func(r *http.Request) bool { return true },
    }
	shutdownChan = make(chan struct{})
	timers       = sync.Map{} // 儲存定時器
    timerID      int64    = 0 // 定時器 ID
    timerMu      sync.Mutex
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

func broadcastMessage(msg string, room string, isGlobal bool) {
    clientsMu.Lock()
    defer clientsMu.Unlock()
    for client, info := range clients {
        if isGlobal || (room != "" && info.Room == room) {
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

func logFunction(info *v8.FunctionCallbackInfo) *v8.Value {
	// 用於保存所有傳入的參數
	var args []interface{}

	// 遍歷所有傳入的參數
	for _, arg := range info.Args() {
		// 轉換每個參數為字串
		args = append(args, arg.String())
	}

	// 使用 fmt.Printf 格式化並打印所有參數，類似 fmt.Println
	fmt.Println("[JS Log]:", args)

	// 返回 `undefined`
	iso := info.Context().Isolate()
	undefined := v8.Undefined(iso)
	return undefined
}
// 初始化 V8 並載入 mudlib
func initV8() {
    global := v8.NewObjectTemplate(iso)

    logFunc := v8.NewFunctionTemplate(iso, logFunction)
	global.Set("log", logFunc)

    global.Set("loadFile", v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 1 {
            return nil
        }
        filePath := args[0].String()
		fmt.Println("loadFile", "filePath", filePath)
        data, err := ioutil.ReadFile(filePath)
        if err != nil {
            log.Println("Load file error:", err)
            return nil
        }

        val, err := v8.JSONParse(info.Context(), string(data))
        if err != nil {
            log.Println("Parse JSON error:", err)
            return nil
        }
        return val
    }))

    // 注入檔案保存函數
    global.Set("saveFile", v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 2 {
            return nil
        }
        filePath := args[0].String()
        data := args[1]
        jsonStr, err := v8.JSONStringify(info.Context(), data)
        if err != nil {
            log.Println("Stringify error:", err)
            return nil
        }
        err = ioutil.WriteFile(filePath, []byte(jsonStr), 0644)
        if err != nil {
            log.Println("Save file error:", err)
            return nil
        }
        return nil
    }))

    global.Set("broadcastToRoom", v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 2 {
            return nil
        }
        msg := args[0].String()
        room := args[1].String()
        broadcastMessage(msg, room, false)
        return nil
    }))

    global.Set("broadcastGlobal", v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) > 0 {
            msg := args[0].String()
            broadcastMessage(msg, "", true)
        }
        return nil
    }))

    global.Set("shutdown", v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        broadcastMessage("System is shutting down...", "", true)
        close(shutdownChan)
        return nil
    }))

	global.Set("setInterval", v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 2 {
            return nil
        }
        callback := args[0]
        intervalMs := args[1].Int32()

        timerMu.Lock()
        id := timerID
        timerID++
        timerMu.Unlock()

        ticker := time.NewTicker(time.Duration(intervalMs) * time.Millisecond)
        timers.Store(id, ticker)

        go func() {
            for {
                select {
                case <-ticker.C:
                    if _, err := info.Context().RunScript("("+callback.String()+")()", "timer.js"); err != nil {
                        log.Printf("Timer execution error: %v", err)
                    }
                case <-shutdownChan:
                    ticker.Stop()
                    timers.Delete(id)
                    return
                }
            }
        }()

        val, err := v8.NewValue(iso, int32(id))
        if err != nil {
            log.Printf("Failed to create timer ID value: %v", err)
            return nil
        }
        return val
    }))

    // 注入 clearInterval
    global.Set("clearInterval", v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 1 {
            return nil
        }
        id := args[0].Int32()

        if ticker, ok := timers.Load(int32(id)); ok {
            ticker.(*time.Ticker).Stop()
            timers.Delete(int32(id))
        }
        return nil
    }))

    ctx = v8.NewContext(iso, global)

    roomFiles := listFiles("rooms", ".json")
    npcFiles := listFiles("npcs", ".json")
    itemFiles := listFiles("items", ".json")
    methodFiles := listFiles("player_methods", ".js")
    playerFiles := listFiles("players", ".json")

    filesJSON := map[string][]string{
        "rooms":   roomFiles,
        "npcs":    npcFiles,
        "items":   itemFiles,
        "methods": methodFiles,
        "players": playerFiles,
    }
	log.Println("filesJSON", filesJSON)
    filesJSONBytes, err := json.Marshal(filesJSON)
    if err != nil {
        log.Fatal("Failed to marshal file lists:", err)
    }
    filesVal, err := v8.JSONParse(ctx, string(filesJSONBytes))
    if err != nil {
        log.Fatal("Failed to parse file lists JSON:", err)
    }
	fmt.Println("filesVal", filesVal)
    ctx.Global().Set("fileLists", filesVal)

    for _, method := range methodFiles {
        scriptBytes, err := ioutil.ReadFile(fmt.Sprintf("domain/player_methods/%s.js", method))
        if err != nil {
            log.Printf("Failed to load player method %s.js: %v", method, err)
            continue
        }
        script := fmt.Sprintf("this.%s = %s", method, string(scriptBytes))
        if _, err := ctx.RunScript(script, fmt.Sprintf("%s.js", method)); err != nil {
            log.Printf("Failed to execute player method %s.js: %v", method, err)
        }
    }

    // 載入 mudlib
    mudlibBytes, err := ioutil.ReadFile("domain/mudlib.js")
    if err != nil {
        log.Fatal("Failed to load mudlib:", err)
    }
    if _, err := ctx.RunScript(string(mudlibBytes), "mudlib.js"); err != nil {
        log.Fatal("Failed to execute mudlib:", err)
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
    clients[conn] = struct{ Conn interface{}; Room string }{Conn: conn, Room: "area1/room1"}
    clientsMu.Unlock()

    ctx.RunScript(fmt.Sprintf("addPlayer('%s')", playerID), "init.js")

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
        script := fmt.Sprintf("processCommand('%s', '%s')", playerID, cmd)
        val, err := ctx.RunScript(script, "cmd.js")
        if err != nil {
            conn.WriteMessage(websocket.TextMessage, []byte("Error: "+err.Error()))
        } else {
            conn.WriteMessage(websocket.TextMessage, []byte(val.String()))
        }

        // 查詢玩家房間並更新
        roomScript := fmt.Sprintf("players['%s'] ? players['%s'].room : 'area1/room1'", playerID, playerID)
        roomVal, err := ctx.RunScript(roomScript, "get_room.js")
        if err == nil && roomVal.IsString() {
            clientsMu.Lock()
            clients[conn] = struct{ Conn interface{}; Room string }{Conn: conn, Room: roomVal.String()}
            clientsMu.Unlock()
        }
    }
}

// Telnet 處理
func handleTelnet(conn net.Conn) {
	defer conn.Close()

    clientsMu.Lock()
    playerID := fmt.Sprintf("player_%d", len(clients)+1)
    clients[conn] = struct{ Conn interface{}; Room string }{Conn: conn, Room: "area1/room1"}
    clientsMu.Unlock()

    ctx.RunScript(fmt.Sprintf("addPlayer('%s')", playerID), "init.js")

    fmt.Fprintf(conn, "Welcome to the MUD! Type commands to play.\r\n> ")

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

        script := fmt.Sprintf("processCommand('%s', '%s')", playerID, cmd)
        val, err := ctx.RunScript(script, "cmd.js")
        if err != nil {
            fmt.Fprintf(conn, "Error: %s\r\n> ", err.Error())
        } else {
            fmt.Fprintf(conn, "%s\r\n> ", val.String())
        }

        // 查詢玩家房間並更新
        roomScript := fmt.Sprintf("players['%s'] ? players['%s'].room : 'area1/room1'", playerID, playerID)
        roomVal, err := ctx.RunScript(roomScript, "get_room.js")
        if err == nil && roomVal.IsString() {
            clientsMu.Lock()
            clients[conn] = struct{ Conn interface{}; Room string }{Conn: conn, Room: roomVal.String()}
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
