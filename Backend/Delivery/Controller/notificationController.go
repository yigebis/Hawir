package Controller

import (
	"Hawir/UseCase"
	"net/http"

	"github.com/gin-gonic/gin"
)

type NotificationController struct {
	NotificattionUseCase UseCase.INotificationUseCase
}

func NewNotificationController(n UseCase.INotificationUseCase) *NotificationController {
	return &NotificationController{
		NotificattionUseCase: n,
	}
}

func (nc *NotificationController) GetNotificationsForTraveller(ctx *gin.Context) {
	id := ctx.Param("travellerId")

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing travel ID"})
		return
	}

	notifications, statusCode, err := nc.NotificattionUseCase.GetNotificationsForTraveller(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, notifications)
}

// MarkNotificationAsRead handles PUT /notification/:travellerId/:notificationId/read
func (nc *NotificationController) MarkNotificationAsRead(ctx *gin.Context) {
	travellerId := ctx.Param("travellerId")
	notificationId := ctx.Param("notificationId")

	// Validate input parameters
	if travellerId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing traveller ID"})
		return
	}
	if notificationId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing notification ID"})
		return
	}

	statusCode, err := nc.NotificattionUseCase.MarkNotificationAsRead(travellerId, notificationId)
	if err != nil {
		// If the UseCase returns an error, send the error status code and message
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "notification marked as read"})
	// Or use ctx.Status(statusCode) if the UseCase returns 204 No Content
}

// MarkNotificationAsUnread handles PUT /notification/:travellerId/:notificationId/unread
func (nc *NotificationController) MarkNotificationAsUnread(ctx *gin.Context) {
	travellerId := ctx.Param("travellerId")
	notificationId := ctx.Param("notificationId")

	// Validate input parameters
	if travellerId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing traveller ID"})
		return
	}
	if notificationId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing notification ID"})
		return
	}

	statusCode, err := nc.NotificattionUseCase.MarkNotificationAsUnread(travellerId, notificationId)
	if err != nil {
		// If the UseCase returns an error, send the error status code and message
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	// If the UseCase returns no error, send a success status code
	ctx.JSON(statusCode, gin.H{"message": "notification marked as unread"})
}
