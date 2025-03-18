package main
import (
	"io/ioutil"
	"log"
	v8 "fsmud/utils/v8go"
)

func cb_saveFile(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 2 {
            return nil
        }
        filePath := args[0].String()
        data := args[1]
        jsonStr, err := v8.JSONStringify(info.Context(), data)
        if err != nil {
            log.Println("Stringify error:", err)
            return nil
        }
        err = ioutil.WriteFile(filePath, []byte(jsonStr), 0644)
        if err != nil {
            log.Println("Save file error:", err)
            return nil
        }
        return nil
}
