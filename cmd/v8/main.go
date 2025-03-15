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

func v8go_cb(iso *v8.Isolate){
	printfn := v8.NewFunctionTemplate(iso, func(info *v8.FunctionCallbackInfo) *v8.Value {
	    fmt.Printf("run printfn() in go: %v\n", info.Args())
	    return nil
	})
	global := v8.NewObjectTemplate(iso)
	global.Set("print", printfn)
	ctx := v8.NewContext(iso, global)
	ctx.RunScript("print('foo')", "print.js") 
}

func v8go_var(iso *v8.Isolate){
	ctx := v8.NewContext()
	obj := ctx.Global()
	obj.Set("version", "v1.0.0")
	val, _ := ctx.RunScript("version", "version.js")
	fmt.Printf("version1: %s\n", val)

	if obj.Has("version") {
	    obj.Set("version", "v1.0.1")
		val, _ := ctx.RunScript("version", "version.js")
		fmt.Printf("version2: %s\n", val)
	}
}

func v8go_err(iso *v8.Isolate){
	ctx := v8.NewContext()
	v, err := ctx.RunScript("10+11;", "err.js")
	if err != nil {
		e := err.(*v8.JSError)
		fmt.Println(e.Message)
		fmt.Println(e.Location)
		fmt.Println(e.StackTrace)

		fmt.Printf("javascript error: %v\n", e)
		fmt.Printf("javascript stack trace: %+v\n", e)
	} else {
		fmt.Println("Run err.js without error.", v)
	}
}

func main() {
    iso := v8.NewIsolate()
	v8simple(iso)
	v8go_cb(iso)
	v8go_var(iso)
	v8go_err(iso)
}
