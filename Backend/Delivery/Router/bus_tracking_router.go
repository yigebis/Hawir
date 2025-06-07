package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type BusTrackingRouter struct {
	BusTrackingController *Controller.BusTrackingController
}

func NewBusTrackingRouter(btc *Controller.BusTrackingController) *BusTrackingRouter {
	return &BusTrackingRouter{
		BusTrackingController: btc,
	}
}

func (btr *BusTrackingRouter) Run(router *gin.Engine, jwt_string string) {
	router.GET("/ws", Infrastructure.AnyLoggedInMiddleware(jwt_string), btr.BusTrackingController.HandleWebSocket)
	router.POST("/bus_tracking/start/:tripID", btr.BusTrackingController.StartBusTracking)
	router.POST("/bus_tracking/stop/:tripID", btr.BusTrackingController.StopBusTracking)
}
