package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type AdvertisementRouter struct {
	AdvertisementController *Controller.AdvertisementController
}

func NewAdvertisementRouter(ac *Controller.AdvertisementController) *AdvertisementRouter {
	return &AdvertisementRouter{
		AdvertisementController: ac,
	}
}

func (ar *AdvertisementRouter) Run(router *gin.Engine, jwt_string string) {
	router.GET("/advertisement/upload_preset", Infrastructure.AgencyMiddleWare(jwt_string), ar.AdvertisementController.GetPublicID)
	router.POST("/advertisement/add", Infrastructure.AgencyMiddleWare(jwt_string), ar.AdvertisementController.AddAdvertisement)
	router.GET("/advertisement/:id", ar.AdvertisementController.GetAdvertisementByID)
	router.GET("/advertisement/all", ar.AdvertisementController.GetAllAdvertisements)
	router.GET("/advertisement/agency/:agencyID", ar.AdvertisementController.GetALlAgencyAdvertisements)
	router.DELETE("/advertisement/delete/:id", Infrastructure.AgencyMiddleWare(jwt_string), ar.AdvertisementController.DeleteAdvertisement)
}
