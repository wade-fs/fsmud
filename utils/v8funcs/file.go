// cmd/mud/v8funcs/file.go

package v8funcs

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"fsmud/utils/v8go"
)

func CbLoadFile() v8go.FunctionCallback {
	return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
		args := info.Args()
		if len(args) < 1 {
			val, _ := v8go.NewValue(info.Context().Isolate(), "Error: loadFile requires a filename")
			return val
		}
		filePath := args[0].String()
		data, err := os.ReadFile(filePath)
		if err != nil {
			log.Printf("Load file error for %s: %v", filePath, err)
			val, _ := v8go.NewValue(info.Context().Isolate(), "")
			return val
		}
		val, err := v8go.NewValue(info.Context().Isolate(), string(data))
		if err != nil {
			log.Printf("Failed to create string value for %s: %v", filePath, err)
			return v8go.Undefined(info.Context().Isolate())
		}
		return val
	}
}

func CbSaveFile() v8go.FunctionCallback {
	return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
		args := info.Args()
		if len(args) < 2 {
			val, _ := v8go.NewValue(info.Context().Isolate(), "Error: saveFile requires filename and content")
			return val
		}
		filePath := args[0].String()
		data := args[1]
		var content string
		if data.IsString() {
			content = data.String()
		} else {
			jsonStr, err := v8go.JSONStringify(info.Context(), data)
			if err != nil {
				val, _ := v8go.NewValue(info.Context().Isolate(), fmt.Sprintf("Error stringifying data: %v", err))
				return val
			}
			content = jsonStr
		}
		dir := filepath.Dir(filePath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			val, _ := v8go.NewValue(info.Context().Isolate(), fmt.Sprintf("Error creating directory: %v", err))
			return val
		}
		if err := ioutil.WriteFile(filePath, []byte(content), 0644); err != nil {
			val, _ := v8go.NewValue(info.Context().Isolate(), fmt.Sprintf("Error saving file: %v", err))
			return val
		}
		return v8go.Undefined(info.Context().Isolate())
	}
}
