// utils/client/manager.go

package client

import (
	"fmt"
	"log"
	"net"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"fsmud/utils/v8go"
)

type ClientInfo struct {
	Conn     interface{} // WebSocket 或 Telnet 連接
	Room     string      // 當前房間
	PlayerID string      // 玩家的唯一 ID
    ConnectionType string
}

func (ci *ClientInfo) Send(msg string) {
	switch c := ci.Conn.(type) {
	case *websocket.Conn:
		if err := c.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
			log.Printf("WebSocket write error: %v", err)
		}
	case net.Conn:
		if _, err := fmt.Fprintf(c, "%s\r\n", msg); err != nil {
			log.Printf("Telnet write error: %v", err)
		}
	}
}

type ClientManager struct {
	clients map[interface{}]ClientInfo // 鍵是連接（Conn），值是 ClientInfo
	mu      sync.Mutex
	v8Ctx   *v8go.Context // 保存 V8 上下文以便調用 JavaScript
}

func NewClientManager(ctx *v8go.Context) *ClientManager {
	return &ClientManager{
		clients: make(map[interface{}]ClientInfo),
		v8Ctx:   ctx, // 初始化時傳入 V8 上下文
	}
}

func (m *ClientManager) SetV8Context(ctx *v8go.Context) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.v8Ctx = ctx
}

func (m *ClientManager) Add(conn interface{}, room, connType string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	playerID := m.GeneratePlayerID()
	m.clients[conn] = ClientInfo{
		Conn:     conn,
		Room:     room,
		PlayerID: playerID,
		ConnectionType: connType,
	}

	// 通過 v8go 將玩家資訊注入 Mudlib
	if m.v8Ctx != nil {
		_, err := m.v8Ctx.RunScript(
			fmt.Sprintf(`addPlayer("%s", "%s", "%s");`, playerID, room, connType),
			"injectPlayer.js",
		)
		if err != nil {
			log.Printf("Failed to inject player %s into Mudlib: %v", playerID, err)
		}
	}
}

func (m *ClientManager) Remove(conn interface{}) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if info, exists := m.clients[conn]; exists {
		delete(m.clients, conn)

		// 通過 v8go 通知 Mudlib 移除玩家
		if m.v8Ctx != nil {
			_, err := m.v8Ctx.RunScript(
				fmt.Sprintf(`removePlayer("%s");`, info.PlayerID),
				"removePlayer.js",
			)
			if err != nil {
				log.Printf("Failed to remove player %s from Mudlib: %v", info.PlayerID, err)
			}
		}
	}
}

func (m *ClientManager) Get(conn interface{}) (ClientInfo, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	info, exists := m.clients[conn]
	return info, exists
}

func (m *ClientManager) UpdateRoom(conn interface{}, room string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if info, exists := m.clients[conn]; exists {
		info.Room = room
		m.clients[conn] = info
	}
}

func (m *ClientManager) Broadcast(msg, room string, isGlobal bool, excludePlayerID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, info := range m.clients {
		if isGlobal || (room != "" && info.Room == room) {
			if excludePlayerID == "" || info.PlayerID != excludePlayerID {
				info.Send(msg)
			}
		}
	}
}

func (m *ClientManager) SendToClient(playerID, msg string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, info := range m.clients {
		log.Printf("SendToClient(%s, %s): %s\n", playerID, info.PlayerID, msg)
		if info.PlayerID == playerID {
			info.Send(msg)
			return
		}
	}
	log.Printf("Player %s not found for sending message", playerID)
}

func (m *ClientManager) GeneratePlayerID() string {
	return fmt.Sprintf("temp_%d_%d", len(m.clients)+1, time.Now().UnixNano())
}
