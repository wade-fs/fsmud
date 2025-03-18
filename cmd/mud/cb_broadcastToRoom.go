package main
import (
	v8 "fsmud/utils/v8go"
)

func cb_broadcastToRoom(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 2 {
            return nil
        }
        msg := args[0].String()
        room := args[1].String()
        broadcastMessage(msg, room, false)
        return nil
}
