// utils/handlers/websocket.go

package handlers

import (
	"fmt"
	"fsmud/utils/client"
	v8 "fsmud/utils/v8go"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
	"log"
	"strings"
)

type WebSocketHandler struct {
	Manager  *client.ClientManager
	Context  *v8.Context
	Upgrader websocket.Upgrader
}

func NewWebSocketHandler(m *client.ClientManager, ctx *v8.Context) *WebSocketHandler {
	return &WebSocketHandler{
		Manager: m,
		Context: ctx,
		Upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true },
		},
	}
}

func (h *WebSocketHandler) Handle(c *gin.Context) {
	conn, err := h.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	playerID := h.Manager.GeneratePlayerID()
	h.Manager.Add(conn, "entrance", "websocket")
    conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "command_result", "message": "Welcome to the MUD!\nPlease login with: login <username> <password>"}`))

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			h.Manager.Remove(conn)
			_,err := h.Context.RunScript(fmt.Sprintf(`removePlayer("%s")`, playerID), "cleanup.js")
			if err != nil {
				e := err.(*v8.JSError)
				fmt.Println(e.Message)
				fmt.Println(e.Location)
				fmt.Println(e.StackTrace)
				fmt.Printf("javascript error: %v", e)
				fmt.Printf("javascript stack trace: %+v", e)
			}
			return
		}

		input := strings.TrimSpace(string(message))
		info, exists := h.Manager.Get(conn)
		if !exists {
			continue
		}

		// 將所有輸入交給 V8 的 processCommand 處理
		script := fmt.Sprintf(`processCommand("%s", "%s")`, info.PlayerID, input)
		val, err := h.Context.RunScript(script, "cmd.js")
		if err != nil {
			e := err.(*v8.JSError)
			fmt.Println(e.Message)
			fmt.Println(e.Location)
			fmt.Println(e.StackTrace)
			fmt.Printf("javascript error: %v", e)
			fmt.Printf("javascript stack trace: %+v", e)
			conn.WriteMessage(websocket.TextMessage, []byte("Error: " + err.Error()))
			conn.WriteMessage(websocket.TextMessage, []byte("Message: " + e.Message))
			conn.WriteMessage(websocket.TextMessage, []byte("Location: " + e.Location))
			conn.WriteMessage(websocket.TextMessage, []byte("StackTrace: " + e.StackTrace))
			continue
		}

		// 處理回傳結果
		result := val.String()
		if result != "" && result != "undefined" {
			conn.WriteMessage(websocket.TextMessage, []byte(result))
		} else {
			conn.WriteMessage(websocket.TextMessage, []byte("")) // 空回應保持連線
		}

		// 更新房間資訊（由 V8 控制）
		roomScript := fmt.Sprintf(`players["%s"] ? players["%s"].room : "entrance"`, info.PlayerID, info.PlayerID)
		roomVal, err := h.Context.RunScript(roomScript, "get_room.js")
		if err == nil && roomVal.IsString() {
			h.Manager.UpdateRoom(conn, roomVal.String())
		}
	}
}
