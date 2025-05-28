package Controller

import (
	"Hawir/Domain"
	"Hawir/Infrastructure"
	"Hawir/UseCase"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type BusTrackingController struct {
	upgrader           websocket.Upgrader
	Hub                *Infrastructure.Hub
	BusTrackingUseCase UseCase.IBusTrackingUseCase
}

func NewBusTrackingController(hub *Infrastructure.Hub, btuc UseCase.IBusTrackingUseCase) *BusTrackingController {
	return &BusTrackingController{
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for now
			},
		},
		Hub:                hub,
		BusTrackingUseCase: btuc,
	}
}

func (btc *BusTrackingController) HandleWebSocket(c *gin.Context) {
	fmt.Println("WebSocket connection requested")
	conn, err := btc.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("Error upgrading connection:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	fmt.Println("WebSocket connection established")
	btc.Hub.Register <- conn

	defer func() {
		btc.Hub.Unregister <- conn
	}()

	for {
		fmt.Println("Waiting for messages...")
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			return
		}

		var trackingData Domain.BusTracking
		err = json.Unmarshal(message, &trackingData)
		if err != nil {
			fmt.Println("Error unmarshalling message:", err)
			continue
		}

		trackingData.Timestamp = time.Now()

		fmt.Println("Received tracking data:", trackingData)
		_, err = btc.BusTrackingUseCase.SaveBusTracking(&trackingData)
		if err != nil {
			fmt.Println("Error saving bus tracking data:", err)
			continue
		}

		btc.Hub.Broadcast <- message
	}
}
