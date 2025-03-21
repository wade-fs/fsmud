// cmd/mud/main.go

package main

import (
	"encoding/json"
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
)

func listFilesWithDepth(dir, ext string, depth int) ([]string, error) {
    var files []string
    err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        // 計算相對路徑以確定深度
        relPath, err := filepath.Rel(dir, path)
        if err != nil {
            return err
        }
        // 計算目錄深度
        dirDepth := strings.Count(relPath, string(os.PathSeparator))
        if info.IsDir() {
            // 如果 depth != -1 且當前目錄深度大於 depth - 1，則跳過子目錄
            if depth != -1 && dirDepth >= depth {
                return filepath.SkipDir
            }
            return nil
        }
        // 只收集符合擴展名的文件
        if strings.HasSuffix(info.Name(), ext) {
            // 對於 depth = -1，收集所有文件；對於 depth = 1，只收集 dirDepth == 0 的文件
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

    dirs := []string{"rooms", "npcs", "items", "players", "maps"}
    filesJSON := make(map[string][]string)

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

    // 獲取 domain 目錄下的一級 .js 文件
    domainJsFiles, err := listFilesWithDepth("domain", ".js", 1)
    if err != nil {
        log.Fatalf("Failed to list .js files in domain: %v", err)
    }
    for _, file := range domainJsFiles {
        scriptBytes, err := ioutil.ReadFile(file)
        if err != nil {
            log.Printf("Failed to read %s: %v", file, err)
            continue
        }
        if _, err := ctx.RunScript(string(scriptBytes), file); err != nil {
            log.Printf("Failed to execute %s: %v", file, err)
        }
    }

    // 獲取 domain 目錄下的一級 .js 文件
    cmdJsFiles, err := listFilesWithDepth("domain/cmds", ".js", 1)
    if err != nil {
        log.Fatalf("Failed to list .js files in domain/cmds: %v", err)
    }
    for _, file := range cmdJsFiles {
        scriptBytes, err := ioutil.ReadFile(file)
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
