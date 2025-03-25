// cmd/mud/v8funcs/shutdown.go

package v8funcs

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"strings"

	"fsmud/utils/client"
	v8 "fsmud/utils/v8go"
)

func CbLoadV8JSON(m *client.ClientManager) v8.FunctionCallback {
    return func(info *v8.FunctionCallbackInfo) *v8.Value {
        m.Broadcast("Reload system data files.", "", true, "")
		LoadV8JSON(info.Context())
        return v8.Undefined(info.Context().Isolate())
    }
}

func CbLoadV8Scripts(m *client.ClientManager) v8.FunctionCallback {
    return func(info *v8.FunctionCallbackInfo) *v8.Value {
        m.Broadcast("Reload system javascript files.", "", true, "")
		LoadV8Scripts(info.Context())
        return v8.Undefined(info.Context().Isolate())
    }
}

func LoadV8Scripts(ctx *v8.Context) {
	if ctx == nil {
		log.Println("Error", "LoadV8Scripts", "ctx is nil")
		return
	}
	for _,dir := range []string{"domain/scripts", "domain/cmds"} {
    	jsFiles, err := listFilesWithDepth(dir, ".js", -1)
    	if err != nil {
    	    log.Fatalf("Failed to list .js files in domain: %v", err)
    	}
    	for _, file := range jsFiles {
    	    scriptBytes, err := os.ReadFile(file)
    	    if err != nil {
    	        log.Printf("Failed to read %s: %v", file, err)
    	        continue
    	    }
			log.Println("LoadV8Scripts", file, string(scriptBytes))
    	    if _, err := ctx.RunScript(string(scriptBytes), file); err != nil {
    	        log.Printf("Failed to execute %s: %v", file, err)
    	    }
    	}
	}
}

func LoadV8JSON(ctx *v8.Context) {
	dirs := []string{"areas", "npcs", "items", "players"}
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
	filesVal, err := v8.JSONParse(ctx, string(filesJSONBytes))
	if err != nil {
		log.Fatal("Failed to parse file lists JSON:", err)
	}
	ctx.Global().Set("fileLists", filesVal)

	if _, err := ctx.RunScript("preloadCache();", "preloadCache"); err != nil {
		log.Fatalf("Failed to preload cache: %v", err)
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
