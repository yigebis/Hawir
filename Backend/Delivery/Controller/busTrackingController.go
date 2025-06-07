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

	// get the role of the user from the context
	userRole := "N" // Default to non-driver
	claims, exists := c.Get("driver")
	mapClaims := getClaims(claims, exists)
	if mapClaims != nil {
		fmt.Println("driver")
		userRole = "D"
	}

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

	go func() {
		for {
			select {
			case message, ok := <-btc.Hub.Broadcast:
				if !ok {
					fmt.Println("Broadcast channel closed")
					return
				}

				err := conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					fmt.Println("Error writing message to WebSocket:", err)
					return
				}
			}
		}
	}()

	// read messages only if the user is a driver
	if userRole == "D" {
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
	} else {
		select {}
	}
}

func (btc *BusTrackingController) StartBusTracking(c *gin.Context) {
	claims, exists := c.Get("driver")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	tripID := c.Param("tripID")
	if tripID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Trip ID is required"})
		return
	}

	code, err := btc.BusTrackingUseCase.StartBusTracking(tripID, mapClaims["id"].(string))
	if err != nil {
		c.JSON(code, gin.H{"error": err.Error()})
		return
	}

	c.JSON(code, gin.H{"message": "Bus tracking started successfully"})
}

func (btc *BusTrackingController) StopBusTracking(c *gin.Context) {
	claims, exists := c.Get("driver")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	tripID := c.Query("tripID")
	if tripID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Trip ID is required"})
		return
	}

	code, err := btc.BusTrackingUseCase.StopBusTracking(tripID, mapClaims["id"].(string))
	if err != nil {
		c.JSON(code, gin.H{"error": err.Error()})
		return
	}

	c.JSON(code, gin.H{"message": "Bus tracking stopped successfully"})
}
