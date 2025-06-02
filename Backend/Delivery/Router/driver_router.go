package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type DriverRouter struct {
	DriverController *Controller.DriverController
}

func NewDriverRouter(dc *Controller.DriverController) *DriverRouter {
	return &DriverRouter{
		DriverController: dc,
	}
}

func (dr *DriverRouter) Run(router *gin.Engine, jwt_signer string) {
	//driver endpoints
	router.GET("/driver/verify", dr.DriverController.VerifyEmail)
	router.GET("/driver/reject", dr.DriverController.RejectEmail)
	router.POST("/driver/login", dr.DriverController.LoginDriver)
	router.GET("/driver/:id", Infrastructure.DriverAgencyMiddleware(jwt_signer), dr.DriverController.GetDriverByID)
	router.POST("/driver/changepassword", Infrastructure.DriverMiddleware(jwt_signer), dr.DriverController.ChangePassword)
	router.GET("/driver/upload_preset", Infrastructure.DriverAgencyMiddleware(jwt_signer), dr.DriverController.GetPublicID)
	router.POST("/driver/upload", Infrastructure.DriverAgencyMiddleware(jwt_signer), dr.DriverController.UploadProfilePhoto)
}
