// cmd/mud/v8funcs/broadcast.go

package v8funcs

import (
	"strings"
    "fsmud/utils/v8go"
    "fsmud/utils/client"
)

func CbSendToPlayer(m *client.ClientManager) v8go.FunctionCallback {
    return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
        args := info.Args()
        if len(args) < 2 {
            // 錯誤處理：參數不足
            return v8go.Undefined(info.Context().Isolate())
        }

        targetID := args[0].String()  // 目標玩家的 ID
        msg := args[1].String()      // 要發送的訊息

        // 查找目標客戶端並發送訊息
		strings.ReplaceAll(msg, "\n", "\r\n")
        m.SendToClient(targetID, msg)

        return v8go.Undefined(info.Context().Isolate())
    }
}
