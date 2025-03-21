// cmd/mud/client/manager.go

package client

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net"
	"sync"
)

type ClientInfo struct {
    Conn       interface{}
    Room       string
    PlayerID   string
}

type ClientManager struct {
	clients map[interface{}]ClientInfo
	mu      sync.Mutex
}

func NewClientManager() *ClientManager {
	return &ClientManager{
		clients: make(map[interface{}]ClientInfo),
	}
}

func (m *ClientManager) Add(conn interface{}, room, playerID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.clients[conn] = ClientInfo{
		Conn:       conn,
		Room:       room,
		PlayerID:   playerID,
	}
}

func (m *ClientManager) Remove(conn interface{}) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.clients, conn)
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
	for client, info := range m.clients {
		if isGlobal || (room != "" && info.Room == room) {
			if excludePlayerID == "" || info.PlayerID != excludePlayerID {
				switch c := client.(type) {
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
		}
	}
}

func (m *ClientManager) GeneratePlayerID() string {
	m.mu.Lock()
	defer m.mu.Unlock()
	return fmt.Sprintf("player_%d", len(m.clients)+1)
}
