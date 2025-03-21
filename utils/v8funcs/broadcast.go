// cmd/mud/v8funcs/broadcast.go

package v8funcs

import (
    "fsmud/utils/v8go"
    "fsmud/utils/client"
)

func BroadcastGlobal(m *client.ClientManager) v8go.FunctionCallback {
    return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
        args := info.Args()
        if len(args) > 0 {
            msg := args[0].String()
            m.Broadcast(msg, "", true, "")
        }
        return v8go.Undefined(info.Context().Isolate())
    }
}

func BroadcastToRoom(m *client.ClientManager) v8go.FunctionCallback {
    return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
        args := info.Args()
        if len(args) < 3 {
            // error handling
            return v8go.Undefined(info.Context().Isolate())
        }
        msg := args[0].String()
        room := args[1].String()
        excludeID := args[2].String()
        m.Broadcast(msg, room, false, excludeID)
        return v8go.Undefined(info.Context().Isolate())
    }
}
