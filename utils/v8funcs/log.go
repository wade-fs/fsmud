// cmd/mud/v8funcs/log.go

package v8funcs

import (
	"fmt"
	"fsmud/utils/v8go"
)

func CbLog() v8go.FunctionCallback {
	return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
		var args []interface{}
		for _, arg := range info.Args() {
			args = append(args, arg.String())
		}
		fmt.Println("[JS Log]:", args)
		return v8go.Undefined(info.Context().Isolate())
	}
}
