package main
import (
	v8 "fsmud/utils/v8go"
)

func cb_broadcastGlobal(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) > 0 {
            msg := args[0].String()
            broadcastMessage(msg, "", true)
        }
        return nil
}
