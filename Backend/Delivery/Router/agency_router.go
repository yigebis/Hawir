package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type AgencyRouter struct {
	AgencyController *Controller.AgencyController
}

func NewAgencyRouter(ac *Controller.AgencyController) *AgencyRouter {
	return &AgencyRouter{
		AgencyController: ac,
	}
}

func (ar *AgencyRouter) Run(router *gin.Engine, jwt_string string) {
	// agency endpoints
	router.POST("/agency/login", ar.AgencyController.LoginAgencyAdmin)

	router.POST("/agency/password/reset", ar.AgencyController.ResetAgencyAdminPassword)
	router.GET("/agency/:id", ar.AgencyController.GetAgencyByUniqueID)
	router.GET("/agency/all", ar.AgencyController.GetAllAgencies)
	// router.POST("/agency/edit", r.UserController.EditAgency)

	// vehicle management endpoints
	router.POST("/agency/bus/add", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.AddBus)
	router.PUT("/agency/bus/edit", ar.AgencyController.EditBus)
	router.DELETE("/agency/bus/delete", ar.AgencyController.DeleteBus)
	router.GET("/agency/bus/:plate_number", ar.AgencyController.GetBusByPlateNumber)
	// router.GET("/agency/bus/all", ar.AgencyController.GetAllBusesByAgencyID)

	// driver management andpoints
	router.POST("/agency/driver/add", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.AddDriver)
	// router.PUT("/agency/driver/edit", ar.AgencyController.EditDriver)
	// router.DELETE("/agency/driver/delete", ar.AgencyController.DeleteDriver)
	// router.GET("/agency/driver/:id", ar.AgencyController.GetDriverByID)
	// router.GET("/agency/driver/all", ar.AgencyController.GetAllDriversByAgencyID)
	// router.GET("/agency/driver/search", ar.AgencyController.SearchDriverByName)
}
