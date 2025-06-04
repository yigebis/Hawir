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
	router.GET("/destination/upload_preset", dr.DestinationController.GetUploadPreset)
	router.POST("/destination/add", dr.DestinationController.AddDestination)
	router.GET("/destination/:id", dr.DestinationController.GetDestinationByID)
	router.PUT("/destination/edit/:id", dr.DestinationController.EditDestination)
	router.GET("/destination/all", dr.DestinationController.GetAllDestinations)
	router.DELETE("/destination/delete/:id", dr.DestinationController.DeleteDestination)

	// separate endpoint for agencies to add stations to destinations
	router.POST("/destination/station/add/:id", dr.DestinationController.AddDestinationStations)

	//destination details endpoints
	router.GET("/destination/details/:id", dr.DestinationController.GetDestinationDetailsByID)
	router.PUT("/destination/details/edit", dr.DestinationController.EditDestinationDetails)
}
