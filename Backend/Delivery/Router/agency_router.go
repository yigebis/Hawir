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
	router.PUT("/agency/bus/edit/:id", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.EditBus)
	// router.DELETE("/agency/bus/delete", ar.AgencyController.DeleteBus) I can't see the point of deleting a bus
	router.GET("/agency/bus/:id", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.GetBusByID)
	router.GET("/agency/bus/all", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.GetAllBusesByAgencyID)

	// driver management andpoints
	router.POST("/agency/driver/add", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.AddDriver)
	// this endpoint is used only for agencies only, not for drivers because with this endpoint, password can be directly changed without entering old password
	router.PUT("/agency/driver/edit", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.EditDriver)
	// deleting the driver doesn't mean removing data from db, rather verified = false
	router.DELETE("/agency/driver/delete/:id", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.DeleteDriver)
	router.GET("/agency/driver/all", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.GetAllDriversByAgencyID)
	// router.GET("/agency/driver/search", Infrastructure.AgencyMiddleWare(jwt_string), ar.AgencyController.SearchDriverByName)
}
