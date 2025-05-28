package Infrastructure

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	Clients    map[*websocket.Conn]bool
	Broadcast  chan []byte
	Register   chan *websocket.Conn
	Unregister chan *websocket.Conn
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[*websocket.Conn]bool),
		Broadcast:  make(chan []byte),
		Register:   make(chan *websocket.Conn),
		Unregister: make(chan *websocket.Conn),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case conn := <-h.Register:
			h.mu.Lock()
			h.Clients[conn] = true
			h.mu.Unlock()
		case conn := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[conn]; ok {
				delete(h.Clients, conn)
				conn.Close()
			}
			h.mu.Unlock()
		case message := <-h.Broadcast:
			h.mu.Lock()
			for conn := range h.Clients {
				conn.WriteMessage(websocket.TextMessage, message)
			}
			h.mu.Unlock()
		}
	}
}
