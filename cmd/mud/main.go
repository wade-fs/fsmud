// cmd/mud/main.go

package main

import (
	"encoding/json"
	"fsmud/utils/client"
	"fsmud/utils/handlers"
	"fsmud/utils/v8funcs"
	"github.com/gin-gonic/gin"
	v8 "fsmud/utils/v8go"
	"log"
	"os"
	"path/filepath"
	"strings"
)

var (
	iso = v8.NewIsolate()
	ctx *v8.Context
)

func listFilesWithDepth(dir, ext string, depth int) ([]string, error) {
	var files []string
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relPath, err := filepath.Rel(dir, path)
		if err != nil {
			return err
		}
		dirDepth := strings.Count(relPath, string(os.PathSeparator))
		if info.IsDir() {
			if depth != -1 && dirDepth >= depth {
				return filepath.SkipDir
			}
			return nil
		}
		if strings.HasSuffix(info.Name(), ext) {
			if depth == -1 || dirDepth == 0 {
				files = append(files, path)
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

func createV8Context(m *client.ClientManager) {
	global := v8.NewObjectTemplate(iso)
	// 基礎函數
	global.Set("log", v8.NewFunctionTemplate(iso, v8funcs.Log()))
	global.Set("loadFile", v8.NewFunctionTemplate(iso, v8funcs.LoadFile()))
	global.Set("saveFile", v8.NewFunctionTemplate(iso, v8funcs.SaveFile()))
	global.Set("setInterval", v8.NewFunctionTemplate(iso, v8funcs.SetInterval()))
	global.Set("clearInterval", v8.NewFunctionTemplate(iso, v8funcs.ClearInterval()))
	// ClientManager 相關函數
	global.Set("sendToPlayer", v8.NewFunctionTemplate(iso, v8funcs.SendToPlayer(m)))
	global.Set("shutdown", v8.NewFunctionTemplate(iso, v8funcs.Shutdown(m)))

	ctx = v8.NewContext(iso, global)
	log.Println("V8 context created with all functions set up.")
}

func extractCmds(files []string, ext string) []string {
	var processed []string
	for _, file := range files {
		base := filepath.Base(file)       // 取得檔案名稱 (含副檔名)
		name := strings.TrimSuffix(base, ext) // 去掉副檔名
		processed = append(processed, name)
	}
	return processed
}

func loadV8Scripts(ctx *v8.Context) {
	dirs := []string{"rooms", "npcs", "items", "players", "maps"}
	filesJSON := make(map[string][]string)

	cmdJsFiles, err := listFilesWithDepth("domain/cmds", ".js", 1)
	if err != nil {
		log.Fatalf("Failed to list .js files in domain/cmds: %v", err)
	} else {
        filesJSON["cmds"] = extractCmds(cmdJsFiles, ".js")
	}

	for _, dir := range dirs {
		dirPath := filepath.Join("domain", dir)
		fileList, err := listFilesWithDepth(dirPath, ".json", -1)
		if err != nil {
			log.Fatalf("Failed to list .json files in %s: %v", dirPath, err)
		}
		filesJSON[dir] = fileList
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

	domainJsFiles, err := listFilesWithDepth("domain", ".js", 1)
	if err != nil {
		log.Fatalf("Failed to list .js files in domain: %v", err)
	}
	for _, file := range domainJsFiles {
		scriptBytes, err := os.ReadFile(file)
		if err != nil {
			log.Printf("Failed to read %s: %v", file, err)
			continue
		}
		if _, err := ctx.RunScript(string(scriptBytes), file); err != nil {
			log.Printf("Failed to execute %s: %v", file, err)
		}
	}

	for _, file := range cmdJsFiles {
		scriptBytes, err := os.ReadFile(file)
		if err != nil {
			log.Printf("Failed to read %s: %v", file, err)
			continue
		}
		if _, err := ctx.RunScript(string(scriptBytes), file); err != nil {
			log.Printf("Failed to execute %s: %v", file, err)
		}
	}

	if _, err := ctx.RunScript("preloadCache();", "preloadCache"); err != nil {
		log.Fatalf("Failed to preload cache: %v", err)
	}
}

func main() {
	manager := client.NewClientManager(nil) // 先創建 manager，ctx 稍後設置
	createV8Context(manager)                // 使用 manager 初始化上下文
	manager.SetV8Context(ctx)               // 回設 ctx 到 manager
	loadV8Scripts(ctx)

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
