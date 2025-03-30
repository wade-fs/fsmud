// cmd/mud/v8funcs/shutdown.go

package v8funcs

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"fsmud/utils/client"
	"fsmud/utils/v8go"
)

func CbLoadV8JSON(m *client.ClientManager) v8go.FunctionCallback {
    return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
        m.Broadcast("Reload system data files.", "", true, "")
		LoadV8JSON(info.Context())
        return v8go.Undefined(info.Context().Isolate())
    }
}

func CbLoadV8Scripts(m *client.ClientManager) v8go.FunctionCallback {
    return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
        m.Broadcast("Reload system javascript files.", "", true, "")
		LoadV8Scripts(info.Context())
        return v8go.Undefined(info.Context().Isolate())
    }
}

func LoadV8Scripts(ctx *v8go.Context) {
	if ctx == nil {
		log.Println("Error", "LoadV8Scripts", "ctx is nil")
		return
	}
	for _,dir := range []string{"domain/scripts", "domain/cmds"} {
    	jsFiles := listFilesWithDepth(dir, ".js", -1)
    	for _, file := range jsFiles {
    	    scriptBytes, err := os.ReadFile(file)
    	    if err != nil {
    	        log.Printf("Failed to read %s: %v\n", file, err)
    	        continue
    	    }
    	    if _, err := ctx.RunScript(string(scriptBytes), file); err != nil {
    	        log.Printf("[Error] Failed to execute %s: %v\n", file, err)
				e := err.(*v8go.JSError)
				log.Print(e.Message)
				log.Print(e.Location)
				log.Print(e.StackTrace)
				log.Printf("[Error] javascript error: %v", e)
				log.Printf("[Error] javascript stack trace: %+v", e)
    	    }
    	}
	}
}

func LoadV8JSON(ctx *v8go.Context) {
	cmdJsFiles := listFilesWithDepth("domain/cmds", ".js", 1)

	filesJSON := map[string][]string{"cmds": extractCmds(cmdJsFiles, ".js")}

	dirs := []string{"areas", "npcs", "items", "players"}
	for _, dir := range dirs {
		dirPath := filepath.Join("domain", dir)
		fileList := listFilesWithDepth(dirPath, ".json", -1)
		filesJSON[dir] = fileList
	}
	// 載入 terrains.json
    terrainsData, err := os.ReadFile("domain/configs/terrains.json")
    if err != nil {
        log.Printf("Failed to read terrains.json: %v", err)
        filesJSON["terrains"] = []string{} // 提供空陣列作為預設值
    } else {
        filesJSON["terrains"] = []string{string(terrainsData)} // 將檔案內容作為字串存入
    }

	filesJSONBytes, err := json.Marshal(filesJSON)
	if err != nil {
		log.Fatal("Failed to marshal file lists:", err)
	}
	filesVal, err := v8go.JSONParse(ctx, string(filesJSONBytes))
	if err != nil {
		log.Fatal("Failed to parse file lists JSON:", err)
	}
	ctx.Global().Set("fileLists", filesVal)

	if _, err := ctx.RunScript("preloadCache();", "preloadCache"); err != nil {
		e := err.(*v8go.JSError)
		log.Print(e.Message)
		log.Print(e.Location)
		log.Print(e.StackTrace)
		log.Printf("[Error] javascript error: %v", e)
		log.Printf("[Error] javascript stack trace: %+v", e)
	}
}
func extractCmds(files []string, ext string) []string {
	var processed []string
	for _, file := range files {
		base := filepath.Base(file)
		name := strings.TrimSuffix(base, ext)
		processed = append(processed, name)
	}
	return processed
}

func listFilesWithDepth(dir, ext string, depth int) []string {
	// 檢查目錄是否存在
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		fmt.Printf("Error: Directory '%s' does not exist.\n", dir)
		return []string{}
	}

	var files []string
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Printf("Error accessing path '%s': %v\n", path, err)
			return err // 遇到錯誤就返回
		}
		relPath, err := filepath.Rel(dir, path)
		if err != nil {
			fmt.Printf("Error getting relative path for '%s': %v\n", path, err)
			return err // 遇到錯誤就返回
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
		fmt.Printf("Error walking directory '%s': %v\n", dir, err)
		return []string{}
	}

	return files
}
