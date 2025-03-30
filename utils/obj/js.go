package obj

import (
    "fmt"
    "strings"
	v8 "fsmud/utils/v8go"
)

// GetScript 獲取指定路徑的腳本內容
func (o *ObjectLoader) insertScript(keyPath string, scriptContent string) {
    o.insertNestedMap(keyPath, scriptContent, o.scripts)
}

// ListScripts 列出所有載入的腳本路徑（支持樹狀結構）
func (o *ObjectLoader) ListScripts() []string {
    var scripts []string
    o.walkScripts(o.scripts, "", &scripts)
    return scripts
}

// walkScripts 遞迴遍歷腳本樹
func (o *ObjectLoader) walkScripts(current map[string]interface{}, prefix string, scripts *[]string) {
    for key, value := range current {
        newPrefix := key
        if prefix != "" {
            newPrefix = prefix + "/" + key
        }

        switch v := value.(type) {
        case string:
            // 當發現腳本時，將完整路徑添加到列表
            *scripts = append(*scripts, newPrefix)
        case map[string]interface{}:
            // 當發現嵌套映射時，繼續遞迴
            o.walkScripts(v, newPrefix, scripts)
        default:
            // 處理意外的類型（可選：記錄警告）
            fmt.Printf("警告：在路徑 %s 發現意外的數據類型: %T\n", newPrefix, value)
        }
    }
}

// GetScript 獲取指定路徑的腳本內容（支持樹狀路徑）
func (o *ObjectLoader) GetScript(path string) (string, error) {
    keys := strings.Split(path, "/")
    var result interface{} = o.scripts

    for _, key := range keys {
        if m, ok := result.(map[string]interface{}); ok {
            result = m[key]
        } else {
            return "", fmt.Errorf("找不到腳本: %s", path)
        }
    }

    if script, ok := result.(string); ok {
        return script, nil
    }
    return "", fmt.Errorf("路徑 %s 不是有效的腳本", path)
}

func (o *ObjectLoader) Run_script(loader *ObjectLoader, iso *v8.Isolate, scriptPath string) {
    ctx := v8.NewContext(iso)

    // 如果未指定路徑，執行所有腳本
    if scriptPath == "" {
        scripts := loader.ListScripts()
        for _, path := range scripts {
        	fmt.Println("執行 js：", path)
            executeScript(loader, ctx, path)
        }
        return
    }

    // 執行指定路徑的腳本
    executeScript(loader, ctx, scriptPath)
}

// 提取執行單個腳本的邏輯
func executeScript(loader *ObjectLoader, ctx *v8.Context, scriptPath string) {
    script, err := loader.GetScript(scriptPath)
    if err != nil {
        fmt.Printf("無法獲取腳本 %s: %v\n", scriptPath, err)
        return
    }

    val, err := ctx.RunScript(script, scriptPath+".js")
    if err != nil {
        e := err.(*v8.JSError)
        fmt.Printf("執行腳本 %s 時發生錯誤:\n", scriptPath)
        fmt.Println(e.Message)
        fmt.Println(e.Location)
        fmt.Println(e.StackTrace)
        return
    }
    fmt.Printf("腳本 %s 執行結果: %v\n", scriptPath, val)
}
