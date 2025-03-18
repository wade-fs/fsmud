package main
import (
	"fmt"
	v8 "fsmud/utils/v8go"
)

func cb_log(info *v8.FunctionCallbackInfo) *v8.Value {
	// 用於保存所有傳入的參數
	var args []interface{}

	// 遍歷所有傳入的參數
	for _, arg := range info.Args() {
		// 轉換每個參數為字串
		args = append(args, arg.String())
	}

	// 使用 fmt.Printf 格式化並打印所有參數，類似 fmt.Println
	fmt.Println("[JS Log]:", args)

	// 返回 `undefined`
	iso := info.Context().Isolate()
	undefined := v8.Undefined(iso)
	return undefined
}
