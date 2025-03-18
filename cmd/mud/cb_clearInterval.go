package main
import (
	"time"
	v8 "fsmud/utils/v8go"
)
func cb_clearInterval(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 1 {
            return nil
        }
        id := args[0].Int32()

        if ticker, ok := timers.Load(int32(id)); ok {
            ticker.(*time.Ticker).Stop()
            timers.Delete(int32(id))
        }
        return nil
}
