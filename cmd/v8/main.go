package main

import (
    "fmt"
    v8 "fsmud/utils/v8go"
)

var iso *v8.Isolate
func v8simple(iso *v8.Isolate) {
	ctx := v8.NewContext(iso)
	ctx.RunScript("const add = (a, b) => a + b", "math.js")
	ctx.RunScript("const result = add(13, 4)", "main.js")
	val, _ := ctx.RunScript("result", "value.js")
	fmt.Printf("addition result: %s\n", val)
}

func v8go(iso *v8.Isolate){
	printfn := v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
	    fmt.Printf("run printfn() in go: %v\n", info.Args())
	    return nil
	})
	global := v8.NewObjectTemplate(iso)
	global.Set("print", printfn)
	ctx := v8.NewContext(iso, global)
	ctx.RunScript("print('foo')", "print.js") 
}

func main() {
    iso := v8.NewIsolate()
	v8simple(iso)
	v8go(iso)
}
