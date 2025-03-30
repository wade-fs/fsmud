// cmd/mud/v8funcs/shutdown.go

package v8funcs

import (
	"fsmud/utils/client"
	"fsmud/utils/v8go"
)

var (
	ShutdownChan = make(chan struct{})
)

func CbShutdown(m *client.ClientManager) v8go.FunctionCallback {
	return func(info *v8go.FunctionCallbackInfo) *v8go.Value {
		m.Broadcast("System is shutting down...", "", true, "")
		close(ShutdownChan)
		return v8go.Undefined(info.Context().Isolate())
	}
}
