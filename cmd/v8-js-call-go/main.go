package main

import (
    "fmt"
    v8 "fsmud/utils/v8go"
)   

var iso *v8.Isolate

func v8go_cb_printf(iso *v8.Isolate) *v8.FunctionTemplate {
    cb_printf := v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 1 {
            fmt.Println("Error: go_print requires at least one argument (format string)")
            return nil
        }

        // Get the format string (first argument)
        formatStr := args[0].String()

        // Convert remaining arguments to interface{} slice for fmt.Printf
        formatArgs := make([]interface{}, len(args)-1)
        for i := 1; i < len(args); i++ {
            // Convert V8 values to Go values
            switch {
            case args[i].IsString():
                formatArgs[i-1] = args[i].String()
            case args[i].IsNumber():
                num := args[i].Number()
                // 檢查是否為整數（不含小數點）
                if num == float64(int64(num)) {
                    formatArgs[i-1] = int64(num)  // 轉換為整數
                } else {
                    formatArgs[i-1] = num  // 保留為浮點數
                }
            case args[i].IsBoolean():
                formatArgs[i-1] = args[i].Boolean()
            default:
                formatArgs[i-1] = args[i].String()
            }
        }

        // Use fmt.Printf with the format string and arguments
        fmt.Printf(formatStr, formatArgs...)
        return nil
    })
	return cb_printf
}

func v8go_cb_println(iso *v8.Isolate) *v8.FunctionTemplate {
    cb_println := v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) == 0 {
            fmt.Println("Error: go_println requires at least one argument")
            return nil
        }

        var values []interface{}
        for _, arg := range args {
            values = append(values, arg.String()) // 轉換所有參數為字串
        }

        fmt.Println(values...) // 正常輸出
        return nil
    })
    return cb_println
}


func main() {
    iso := v8.NewIsolate()
    global := v8.NewObjectTemplate(iso)

    cb_printf  := v8go_cb_printf(iso)
    cb_println := v8go_cb_println(iso)

    global.Set("go_printf", cb_printf)
    global.Set("go_println", cb_println)

    ctx := v8.NewContext(iso, global)
    ctx.RunScript(`let count=0; count += 10; go_printf("Hello %s, count=%d\n", "wade", count);`, "print.js")              
    ctx.RunScript(`count += 10; go_println("count=", count);`, "print.js")              
}
