// cmd/mud/main.go

package main

import (
	"encoding/json"
	"fmt"
	"fsmud/utils/client"
	"fsmud/utils/handlers"
	"fsmud/utils/v8funcs"
	"github.com/gin-gonic/gin"
	v8 "fsmud/utils/v8go"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

var (
    clients   = make(map[interface{}]client.ClientInfo)
    clientsMu sync.Mutex
)

func listFiles(dir, ext string) []string {
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

func initV8(m *client.ClientManager) *v8.Context {
	iso := v8.NewIsolate()
	global := v8.NewObjectTemplate(iso)

	global.Set("log", v8.NewFunctionTemplate(iso, v8funcs.Log()))
	global.Set("loadFile", v8.NewFunctionTemplate(iso, v8funcs.LoadFile()))
	global.Set("saveFile", v8.NewFunctionTemplate(iso, v8funcs.SaveFile()))
	global.Set("broadcastToRoom", v8.NewFunctionTemplate(iso, v8funcs.BroadcastToRoom(m)))
	global.Set("broadcastGlobal", v8.NewFunctionTemplate(iso, v8funcs.BroadcastGlobal(m)))
	global.Set("shutdown", v8.NewFunctionTemplate(iso, v8funcs.Shutdown(m)))
	global.Set("setInterval", v8.NewFunctionTemplate(iso, v8funcs.SetInterval()))
	global.Set("clearInterval", v8.NewFunctionTemplate(iso, v8funcs.ClearInterval()))

	ctx := v8.NewContext(iso, global)

	roomFiles := listFiles("rooms", ".json")
	npcFiles := listFiles("npcs", ".json")
	itemFiles := listFiles("items", ".json")
	cmdFiles := listFiles("cmds", ".js")
	playerFiles := listFiles("players", ".json")

	filesJSON := map[string][]string{
		"rooms":   roomFiles,
		"npcs":    npcFiles,
		"items":   itemFiles,
		"cmds":    cmdFiles,
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
		"domain/item.js",
		"domain/command.js",
		"domain/npc.js",
		"domain/room.js",
		"domain/player.js",
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

	return ctx
}

func main() {
	manager := client.NewClientManager()
	ctx := initV8(manager)

	r := gin.Default()
	r.Static("/domain/static", "./domain/static")
	r.GET("/", func(c *gin.Context) {
		c.File("./domain/static/index.html")
	})

	wsHandler := handlers.NewWebSocketHandler(manager, ctx)
	r.GET("/ws", wsHandler.Handle)

	go handlers.StartTelnetServer(manager, ctx)
	go r.Run(":8080")

	<-v8funcs.ShutdownChan
	log.Println("Server shutdown")
	os.Exit(0)
}
