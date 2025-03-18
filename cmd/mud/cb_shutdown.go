package main
import (
	v8 "fsmud/utils/v8go"
)

var (
	shutdownChan = make(chan struct{})
)

func cb_shutdown(info *v8.FunctionCallbackInfo) *v8.Value {
        broadcastMessage("System is shutting down...", "", true)
        close(shutdownChan)
        return nil
}
