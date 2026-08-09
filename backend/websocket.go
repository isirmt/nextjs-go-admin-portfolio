package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

const (
	wsWriteWait  = 2 * time.Second
	wsPongWait   = 60 * time.Second
	wsPingPeriod = 50 * time.Second
	wsBufferSize = 32
)

type workClickEvent struct {
	Type   string `json:"type"`
	WorkID string `json:"workId"`
	Seq    uint64 `json:"seq"`
}

type wsClient struct {
	conn *websocket.Conn
	send chan []byte
}

type wsHub struct {
	mu      sync.Mutex
	clients map[*wsClient]struct{}
}

func createWsHub() *wsHub {
	return &wsHub{clients: make(map[*wsClient]struct{})}
}

func (h *wsHub) Add(conn *websocket.Conn) *wsClient {
	client := &wsClient{
		conn: conn,
		send: make(chan []byte, wsBufferSize),
	}
	h.mu.Lock()
	h.clients[client] = struct{}{}
	h.mu.Unlock()
	return client
}

func (h *wsHub) Remove(client *wsClient) {
	if client == nil {
		return
	}
	h.mu.Lock()
	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		close(client.send)
	}
	h.mu.Unlock()
}

func (h *wsHub) Broadcast(message []byte) {
	if h == nil {
		return
	}
	h.mu.Lock()
	clients := make([]*wsClient, 0, len(h.clients))
	for client := range h.clients {
		clients = append(clients, client)
	}
	h.mu.Unlock()

	for _, client := range clients {
		select {
		case client.send <- message:
		default:
			h.Remove(client)
			_ = client.conn.Close()
		}
	}
}

func (pSrv *server) handleWS(c echo.Context) error {
	if pSrv.wsHub == nil {
		return c.NoContent(http.StatusServiceUnavailable)
	}

	upgrader := pSrv.wsUpgrader()
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	client := pSrv.wsHub.Add(conn)

	conn.SetReadLimit(512)
	conn.SetReadDeadline(time.Now().Add(wsPongWait))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(wsPongWait))
		return nil
	})

	go func() {
		ticker := time.NewTicker(wsPingPeriod)
		defer ticker.Stop()
		for {
			select {
			case message, ok := <-client.send:
				if !ok {
					_ = conn.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}
				conn.SetWriteDeadline(time.Now().Add(wsWriteWait))
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					pSrv.wsHub.Remove(client)
					_ = conn.Close()
					return
				}
			case <-ticker.C:
				conn.SetWriteDeadline(time.Now().Add(wsWriteWait))
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					pSrv.wsHub.Remove(client)
					_ = conn.Close()
					return
				}
			}
		}
	}()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}

	pSrv.wsHub.Remove(client)
	return conn.Close()
}

func (pSrv *server) wsUpgrader() websocket.Upgrader {
	allowedOrigin := strings.TrimSpace(pSrv.allowedOrigin)
	return websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			if allowedOrigin == "" || allowedOrigin == "*" {
				return true
			}
			return r.Header.Get("Origin") == allowedOrigin
		},
	}
}

func (pSrv *server) broadcastWorkClick(workID string) {
	if pSrv.wsHub == nil {
		return
	}
	seq := atomic.AddUint64(&pSrv.wsSeq, 1)
	event := workClickEvent{
		Type:   "work_click",
		WorkID: workID,
		Seq:    seq,
	}
	payload, err := json.Marshal(event)
	if err != nil {
		return
	}
	pSrv.wsHub.Broadcast(payload)
}
