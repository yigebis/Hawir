package Router

import (
	"Hawir/Delivery/Controller"

	"github.com/gin-gonic/gin"
)

type ReviewRouter struct {
	ReviewController *Controller.ReviewController
}

func NewReviewRouter (rvc *Controller.ReviewController) *ReviewRouter {
	return &ReviewRouter{
		ReviewController: rvc,
	}
}

func (rfr *ReviewRouter) Run(router *gin.Engine, jwt_string string) {
	router.POST("/travel/review", rfr.ReviewController.PostReview)
	router.GET("/reviews/:travelId", rfr.ReviewController.GetReviewsForTravel)
	router.GET("/rating/:travelId", rfr.ReviewController.GetTravelRating)
	router.GET("/rating/agency/:agencyId", rfr.ReviewController.GetAgencyRating)
}
