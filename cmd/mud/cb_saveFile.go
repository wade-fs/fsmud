package main
import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	v8 "fsmud/utils/v8go"
)

func cb_saveFile(info *v8.FunctionCallbackInfo) *v8.Value {
    args := info.Args()
    if len(args) < 2 {
        val, err := v8.NewValue(info.Context().Isolate(), "Error: saveFile requires filename and content")
        if err != nil {
            log.Printf("Failed to create error value: %v", err)
            return nil
        }
        return val
    }

    filePath := args[0].String()
    data := args[1]

    // Stringify the data if it's not already a string
    var content string
    if data.IsString() {
        content = data.String()
    } else {
        jsonStr, err := v8.JSONStringify(info.Context(), data)
        if err != nil {
            log.Printf("Stringify error: %v", err)
            val, err := v8.NewValue(info.Context().Isolate(), fmt.Sprintf("Error stringifying data: %v", err))
            if err != nil {
                log.Printf("Failed to create error value: %v", err)
                return nil
            }
            return val
        }
        content = jsonStr
    }

    // Ensure the directory exists
    dir := filepath.Dir(filePath)
    if err := os.MkdirAll(dir, 0755); err != nil {
        val, err := v8.NewValue(info.Context().Isolate(), fmt.Sprintf("Error creating directory: %v", err))
        if err != nil {
            log.Printf("Failed to create error value: %v", err)
            return nil
        }
        return val
    }

    // Write the file
    if err := ioutil.WriteFile(filePath, []byte(content), 0644); err != nil {
        val, err := v8.NewValue(info.Context().Isolate(), fmt.Sprintf("Error saving file: %v", err))
        if err != nil {
            log.Printf("Failed to create error value: %v", err)
            return nil
        }
        return val
    }

    // Return undefined on success
    val := v8.Undefined(info.Context().Isolate())
    return val
}
