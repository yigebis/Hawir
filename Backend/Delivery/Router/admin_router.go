package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

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

func (ar *AdminRouter) Run(router *gin.Engine, jwt_string string) {
	//admin-side endpoints
	router.POST("/admin/login", ar.AdminController.Login)
	router.POST("/agency/add", ar.AdminController.AddAgency)
	router.DELETE("/agency/delete/:id", Infrastructure.AdminMiddleware(jwt_string), ar.AdminController.DeleteAgency)
	router.PUT("/agency/edit/:id", ar.AdminController.EditAgency)
}
