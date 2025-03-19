package main
import (
	"log"
	v8 "fsmud/utils/v8go"
)

func cb_broadcastToRoom(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 3 {
			log.Println("broadcastToRoom: insufficient arguments")
            return nil
        }
        msg := args[0].String()
        room := args[1].String()
		excludeId := args[2].String()
        broadcastMessage(msg, room, false, excludeId)
        return nil
}
