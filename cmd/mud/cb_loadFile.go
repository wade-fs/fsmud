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
        return nil
    }
    filePath := args[0].String()
	fmt.Println("loadFile", "filePath", filePath)
    data, err := ioutil.ReadFile(filePath)
    if err != nil {
        log.Println("Load file error:", err)
        return nil
    }

    val, err := v8.JSONParse(info.Context(), string(data))
    if err != nil {
        log.Println("Parse JSON error:", err)
        return nil
    }
    return val
}
