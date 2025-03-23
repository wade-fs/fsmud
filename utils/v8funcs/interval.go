// cmd/mud/v8funcs/interval.go

package v8funcs

import (
	"log"
	"sync"
	"time"
	v8 "fsmud/utils/v8go"
)

var (
	timers  = sync.Map{}
	timerID int64
	timerMu sync.Mutex
)

func CbSetInterval() v8.FunctionCallback {
	return func(info *v8.FunctionCallbackInfo) *v8.Value {
		args := info.Args()
		if len(args) < 2 {
			return v8.Undefined(info.Context().Isolate())
		}
		callback := args[0]
		intervalMs := args[1].Int32()
		timerMu.Lock()
		id := timerID
		timerID++
		timerMu.Unlock()

		ticker := time.NewTicker(time.Duration(intervalMs) * time.Millisecond)
		timers.Store(id, ticker)

		go func() {
			for {
				select {
				case <-ticker.C:
					if _, err := info.Context().RunScript("("+callback.String()+")()", "timer.js"); err != nil {
						log.Printf("Timer execution error: %v", err)
					}
				case <-ShutdownChan:
					ticker.Stop()
					timers.Delete(id)
					return
				}
			}
		}()

		val, err := v8.NewValue(info.Context().Isolate(), int32(id))
		if err != nil {
			log.Printf("Failed to create timer ID value: %v", err)
			return v8.Undefined(info.Context().Isolate())
		}
		return val
	}
}

func CbClearInterval() v8.FunctionCallback {
	return func(info *v8.FunctionCallbackInfo) *v8.Value {
		args := info.Args()
		if len(args) < 1 {
			return v8.Undefined(info.Context().Isolate())
		}
		id := args[0].Int32()
		if ticker, ok := timers.Load(int32(id)); ok {
			ticker.(*time.Ticker).Stop()
			timers.Delete(int32(id))
		}
		return v8.Undefined(info.Context().Isolate())
	}
}
