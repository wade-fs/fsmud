// cmd/mud/v8funcs/log.go

package v8funcs

import (
	"fmt"
	v8 "fsmud/utils/v8go"
)

func Log() v8.FunctionCallback {
	return func(info *v8.FunctionCallbackInfo) *v8.Value {
		var args []interface{}
		for _, arg := range info.Args() {
			args = append(args, arg.String())
		}
		fmt.Println("[JS Log]:", args)
		return v8.Undefined(info.Context().Isolate())
	}
}
