package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	v8 "fsmud/utils/v8go" // 根據實際 v8go 套件路徑調整
)

// 儲存腳本內容的 map
var scripts = make(map[string]string)

// 載入指定目錄中的所有 JavaScript 檔案
func loadScripts(dir string) error {
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(path, ".js") {
			content, err := ioutil.ReadFile(path)
			if err != nil {
				return err
			}
			relPath, _ := filepath.Rel(dir, path)
			relPath = strings.ReplaceAll(relPath, string(os.PathSeparator), "/")
			fmt.Println("載入腳本:", relPath)
			scripts[relPath] = string(content)
		}
		return nil
	})
	return err
}

func main() {
	// 載入腳本（假設位於 "scripts" 目錄）
	err := loadScripts("rooms")
	if err != nil {
		fmt.Println("無法載入腳本:", err)
		return
	}

	// 創建 V8 隔離環境和全局上下文
	iso := v8.NewIsolate()
	ctx := v8.NewContext(iso)

	// 定義 console.log 函數（模擬 JavaScript 的 console.log）
	consoleLogFn := v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
		args := info.Args()
		for _, arg := range args {
			fmt.Print(arg.String(), " ")
		}
		fmt.Println()
		return nil
	})
	consoleObj := v8.NewObjectTemplate(iso)
	consoleObj.Set("log", consoleLogFn)
	global := ctx.Global()
	ni,_ := consoleObj.NewInstance(ctx)
	global.Set("console", ni)

	// 編譯並執行所有非 main.js 的腳本
	for scriptName, scriptContent := range scripts {
		if scriptName == "main.js" {
			continue
		}
		script, err := iso.CompileUnboundScript(scriptContent, scriptName, v8.CompileOptions{})
		if err != nil {
			fmt.Println("編譯腳本失敗:", scriptName, err)
			continue
		}
		_, err = script.Run(ctx)
		if err != nil {
			fmt.Println("執行腳本失敗:", scriptName, err)
		}
	}

	// 編譯並執行 main.js
	mainScript, exists := scripts["main.js"]
	if !exists {
		fmt.Println("未找到 main.js")
		return
	}
	script, err := iso.CompileUnboundScript(mainScript, "main.js", v8.CompileOptions{})
	if err != nil {
		fmt.Println("編譯 main.js 失敗:", err)
		return
	}
	_, err = script.Run(ctx)
	if err != nil {
		fmt.Println("執行 main.js 失敗:", err)
	}
}
