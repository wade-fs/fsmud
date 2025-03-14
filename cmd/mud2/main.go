package main

import (
	"fmt"
)

// 記錄 LPC 物件
type LPCObject struct {
	Name    string
	Props   map[string]string
	Methods map[string]func(*LPCObject, string) string
}

// 新增變數
func (obj *LPCObject) SetProp(key, value string) {
	obj.Props[key] = value
}

// 呼叫方法
func (obj *LPCObject) CallMethod(method string, param string) string {
	if fn, ok := obj.Methods[method]; ok {
		return fn(obj, param)
	}
	return "未知的方法: " + method
}

// 創建房間
func createRoom(name, desc string) *LPCObject {
	room := &LPCObject{
		Name:    name,
		Props:   map[string]string{"description": desc},
		Methods: make(map[string]func(*LPCObject, string) string),
	}

	// 設定 "look" 方法
	room.Methods["look"] = func(obj *LPCObject, _ string) string {
		return obj.Props["description"]
	}

	return room
}

func main() {
	// 創建一個房間
	room := createRoom("開始之地", "你站在一個小房間裡，周圍都是石牆。")

	// 測試指令
	fmt.Println("房間描述:", room.CallMethod("look", ""))
}

