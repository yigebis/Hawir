package Router

import (
	"Hawir/Delivery/Controller"

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

func (btr *BusTrackingRouter) Run(router *gin.Engine) {
	router.GET("/ws", btr.BusTrackingController.HandleWebSocket)
}
