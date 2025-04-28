package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type TravelRouter struct {
	TravelController *Controller.TravelController
}

func NewTravelRouter(tc *Controller.TravelController) *TravelRouter {
	return &TravelRouter{
		TravelController: tc,
	}
}

func (tr *TravelRouter) Run(router *gin.Engine, jwt_string string) {
	router.POST("/travel/add", Infrastructure.AgencyMiddleWare(jwt_string), tr.TravelController.CreateTravel)          //agency authorization
	router.PUT("/travel/edit", Infrastructure.AgencyMiddleWare(jwt_string), tr.TravelController.EditTravel)            //agency authorization
	router.GET("/travel/:id", tr.TravelController.ViewTravelById)                                                      //no authorization
	router.GET("/travels/:agencyID", tr.TravelController.ViewTravelsByAgencyId)                                        //no authorization
	router.GET("/travels/search", tr.TravelController.SearchTravel)                                                    //no authorization
	router.DELETE("/travel/cancel/:id", Infrastructure.AgencyMiddleWare(jwt_string), tr.TravelController.CancelTravel) //agency authorization
}
