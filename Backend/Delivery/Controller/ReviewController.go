package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type ReviewController struct {
	ReviewUseCase           UseCase.IReviewUseCase
	TravelRatingUseCase     UseCase.ITravelRatingUseCase
	AgencyStatisticsUseCase UseCase.IAgencyRatingUseCase
	V                       *validator.Validate
}

func NewReviewController(rvu UseCase.IReviewUseCase, travelRatingUseCase UseCase.ITravelRatingUseCase, agencyStatisticsUseCase UseCase.IAgencyRatingUseCase) *ReviewController {
	return &ReviewController{
		ReviewUseCase:           rvu,
		V:                       validator.New(),
		TravelRatingUseCase:     travelRatingUseCase,
		AgencyStatisticsUseCase: agencyStatisticsUseCase,
	}
}

func (rvc *ReviewController) PostReview(ctx *gin.Context) {
	review := Domain.RatingAndFeedback{}
	err := ctx.ShouldBindJSON(&review)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = rvc.V.Struct(review)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}
	
	statusCode, err := rvc.ReviewUseCase.PostReview(&review)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "review posted successfully"})
}

func (rvc *ReviewController) GetReviewsForTravel(ctx *gin.Context) {
	id := ctx.Param("travelId")

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing travel ID"})
		return
	}

	reviews, statusCode, err := rvc.ReviewUseCase.GetReviewsForTravel(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, reviews)
}

func (rvu *ReviewController) GetTravelRating(ctx *gin.Context) {
	travelId := ctx.Param("travelId")
	if travelId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing travel ID"})
		return
	}
	travelRating, statusCode, err := rvu.TravelRatingUseCase.GetTravelRating(travelId)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, travelRating)
}

func (rvu *ReviewController) GetAgencyRating(ctx *gin.Context) {
	agencyId := ctx.Param("AgencyId")
	if agencyId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing agency ID"})
		return
	}

	agencyRating, statusCode, err := rvu.AgencyStatisticsUseCase.GetAgencyRating(agencyId)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, agencyRating)
}
