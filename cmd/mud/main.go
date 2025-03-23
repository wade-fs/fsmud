// cmd/mud/main.go

package main

import (
	"github.com/gin-gonic/gin"
	v8 "fsmud/utils/v8go"
	"log"
	"os"

	"fsmud/utils/client"
	"fsmud/utils/handlers"
	"fsmud/utils/v8funcs"
)

var (
	iso = v8.NewIsolate()
	ctx *v8.Context
)

func createV8Context(m *client.ClientManager) {
	global := v8.NewObjectTemplate(iso)
	// 基礎函數
	global.Set("log", v8.NewFunctionTemplate(iso, v8funcs.CbLog()))
	global.Set("loadFile", v8.NewFunctionTemplate(iso, v8funcs.CbLoadFile()))
	global.Set("saveFile", v8.NewFunctionTemplate(iso, v8funcs.CbSaveFile()))
	global.Set("setInterval", v8.NewFunctionTemplate(iso, v8funcs.CbSetInterval()))
	global.Set("clearInterval", v8.NewFunctionTemplate(iso, v8funcs.CbClearInterval()))
	// ClientManager 相關函數
	global.Set("sendToPlayer", v8.NewFunctionTemplate(iso, v8funcs.CbSendToPlayer(m)))
	global.Set("shutdown", v8.NewFunctionTemplate(iso, v8funcs.CbShutdown(m)))
	global.Set("reloadJs", v8.NewFunctionTemplate(iso, v8funcs.CbLoadV8Scripts(m)))
	global.Set("reloadJSON", v8.NewFunctionTemplate(iso, v8funcs.CbLoadV8JSON(m)))
	global.Set("hashPassword", v8.NewFunctionTemplate(iso, v8funcs.CbHashPassword()))
	global.Set("comparePassword", v8.NewFunctionTemplate(iso, v8funcs.CbComparePassword()))

	ctx = v8.NewContext(iso, global)
	log.Println("V8 context created with all functions set up.")
}

func main() {
	manager := client.NewClientManager(nil) // 先創建 manager，ctx 稍後設置
	createV8Context(manager)                // 使用 manager 初始化上下文
	manager.SetV8Context(ctx)               // 回設 ctx 到 manager
	v8funcs.LoadV8Scripts(ctx)
	v8funcs.LoadV8JSON(ctx)

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
