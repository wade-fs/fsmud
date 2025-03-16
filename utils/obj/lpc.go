package obj

type LPCObject struct {
	Name    string
	FName   string
	Props   map[string]string
	Methods map[string]func(*LPCObject, string) string
}

func (lpc *LPCObject) SetProp(key, value string) {
	lpc.Props[key] = value
}

func (lpc *LPCObject) GetProp(key string) string {
	return lpc.Props[key]
}

func (lpc *LPCObject) CallMethod(method string, param string) string {
	if fn, ok := lpc.Methods[method]; ok {
		return fn(lpc, param)
	}
	return "未知的方法: " + method
}
