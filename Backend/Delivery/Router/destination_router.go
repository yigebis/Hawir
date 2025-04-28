package Router

import (
	"Hawir/Delivery/Controller"

	"github.com/gin-gonic/gin"
)

type DestinationRouter struct {
	DestinationController *Controller.DestinationController
}

func NewDestinationRouter(dc *Controller.DestinationController) *DestinationRouter {
	return &DestinationRouter{
		DestinationController: dc,
	}
}

func (dr *DestinationRouter) Run(router *gin.Engine) {
	//destination endpoints
	router.POST("/destination/add", dr.DestinationController.AddDestination)
	router.GET("/destination/:id", dr.DestinationController.GetDestinationByID)
	router.PUT("/destination/edit", dr.DestinationController.EditDestination)
	router.GET("/destination/all", dr.DestinationController.ViewAllDestinations)
}
