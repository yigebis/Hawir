package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type NotificationRouter struct {
	NotificationController *Controller.NotificationController
}

func NewNotificationRouter(nc *Controller.NotificationController) *NotificationRouter {
	return &NotificationRouter{
		NotificationController: nc,
	}
}

func (nr *NotificationRouter) Run(router *gin.Engine, jwt_string string) {
	router.GET("/notification/:travellerId", Infrastructure.UserMiddleware(jwt_string), nr.NotificationController.GetNotificationsForTraveller)
	router.PUT("/notification/:travellerId/:notificationId/read", Infrastructure.UserMiddleware(jwt_string), nr.NotificationController.MarkNotificationAsRead)
	router.PUT("/notification/:travellerId/:notificationId/unread", Infrastructure.UserMiddleware(jwt_string),nr.NotificationController.MarkNotificationAsUnread)
}