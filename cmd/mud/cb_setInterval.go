package main
import (
	"log"
	"sync"
	"time"
	v8 "fsmud/utils/v8go"
)

var (
    timers       = sync.Map{} // 儲存定時器                                                        
    timerID      int64    = 0 // 定時器 ID                                                         
    timerMu      sync.Mutex
)

func cb_setInterval(info *v8.FunctionCallbackInfo) *v8.Value {
        args := info.Args()
        if len(args) < 2 {
            return nil
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
                case <-shutdownChan:
                    ticker.Stop()
                    timers.Delete(id)
                    return
                }
            }
        }()

        val, err := v8.NewValue(iso, int32(id))
        if err != nil {
            log.Printf("Failed to create timer ID value: %v", err)
            return nil
        }
        return val
}
