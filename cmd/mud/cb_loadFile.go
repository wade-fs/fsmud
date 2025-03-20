package main
import (
	"fmt"
	"io/ioutil"
	"log"
	v8 "fsmud/utils/v8go"
)

func cb_loadFile(info *v8.FunctionCallbackInfo) *v8.Value {
    args := info.Args()
    if len(args) < 1 {
        val, err := v8.NewValue(info.Context().Isolate(), "Error: loadFile requires a filename")
        if err != nil {
            log.Printf("Failed to create error value: %v", err)
            return nil
        }
        return val
    }
    filePath := args[0].String()
    fmt.Println("loadFile", "filePath", filePath) // Keep your debug print

    data, err := ioutil.ReadFile(filePath)
    if err != nil {
        log.Printf("Load file error for %s: %v", filePath, err)
        val, err := v8.NewValue(info.Context().Isolate(), "") // Return empty string on error
        if err != nil {
            log.Printf("Failed to create empty string value: %v", err)
            return nil
        }
        return val
    }

    log.Printf("Info cb_loadFile() loaded content: %s", string(data)) // Keep your debug log
    val, err := v8.NewValue(info.Context().Isolate(), string(data))
    if err != nil {
        log.Printf("Failed to create string value for %s: %v", filePath, err)
        return nil
    }
    return val
}
