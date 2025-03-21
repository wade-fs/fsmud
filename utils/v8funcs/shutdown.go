// cmd/mud/v8funcs/shutdown.go

package v8funcs

import (
	"fsmud/utils/client"
	v8 "fsmud/utils/v8go"
)

var (
	ShutdownChan = make(chan struct{})
)

func Shutdown(m *client.ClientManager) v8.FunctionCallback {
	return func(info *v8.FunctionCallbackInfo) *v8.Value {
		m.Broadcast("System is shutting down...", "", true, "")
		close(ShutdownChan)
		return v8.Undefined(info.Context().Isolate())
	}
}
