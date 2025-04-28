package Router

import (
	"Hawir/Delivery/Controller"

	"github.com/gin-gonic/gin"
)

type AdminRouter struct {
	AdminController *Controller.AdminController
}

func NewAdminRouter(ac *Controller.AdminController) *AdminRouter {
	return &AdminRouter{
		AdminController: ac,
	}
}

func (ar *AdminRouter) Run(router *gin.Engine) {
	//admin-side endpoints
	router.POST("/agency/add", ar.AdminController.AddAgency)
	router.DELETE("/agency/delete/:id", ar.AdminController.DeleteAgency)
	router.PUT("/agency/edit/:id", ar.AdminController.EditAgency)
}
