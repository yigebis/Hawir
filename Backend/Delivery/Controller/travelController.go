package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type TravelController struct {
	TravelUseCase UseCase.ITravelUseCase
	V             *validator.Validate
}

func NewTravelController(t UseCase.ITravelUseCase) *TravelController {
	return &TravelController{
		TravelUseCase: t,
		V:             validator.New(),
	}
}

func (tc *TravelController) CreateTravel(ctx *gin.Context) {
	// CreateTravel creates a new travel
	travel := Domain.Travel{}

	err := ctx.ShouldBindBodyWithJSON(&travel)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload" /*, "details": err.Error()*/})
		return
	}

	err = tc.V.Struct(travel)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload" /*, "details": err.Error()*/})
		return
	}

	statusCode, err := tc.TravelUseCase.CreateTravel(&travel)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "travel created successfully"})
}

func (tc *TravelController) EditTravel(ctx *gin.Context) {
	// EditTravel edits a travel
	travel := Domain.Travel{}

	err := ctx.ShouldBindJSON(&travel)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	statusCode, err := tc.TravelUseCase.EditTravel(&travel)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "travel edited successfully"})
}

func (tc *TravelController) ViewTravelById(ctx *gin.Context) {
	// ViewTravelById views a travel by id
	id := ctx.Param("id")

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing travel ID"})
		return
	}

	travel, statusCode, err := tc.TravelUseCase.ViewTravelById(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, travel)
}

func (tc *TravelController) ViewTravelsByAgencyId(ctx *gin.Context) {
	// ViewTravelsByAgencyId views travels by agency id
	agencyId := ctx.Param("agencyID")

	travels, statusCode, err := tc.TravelUseCase.ViewTravelsByAgencyId(agencyId)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, travels)
}

func (tc *TravelController) SearchTravel(ctx *gin.Context) {
	searchParams := Domain.SearchParams{}

	searchParams.AgencyID = ctx.Query("agency_id")
	searchParams.Destination = ctx.Query("destination")
	searchParams.StartLocation = ctx.Query("start_location")
	// searchParams.HasPayBack = ctx.Query("has_payback") == "true"
	searchParams.PriceMin = ctx.Query("price_min")
	searchParams.PriceMax = ctx.Query("price_max")

	dateMinStr := ctx.Query("date_min")
	dateMaxStr := ctx.Query("date_max")

	if dateMinStr != "" {
		dateMin, err := time.Parse("2006-01-02", dateMinStr) // Expected format: YYYY-MM-DD
		if err != nil {
			ctx.JSON(400, gin.H{"error": "Invalid datemin format. Use YYYY-MM-DD."})
			return
		}
		searchParams.DateMin = dateMin
	}

	if dateMaxStr != "" {
		dateMax, err := time.Parse("2006-01-02", dateMaxStr) // Expected format: YYYY-MM-DD
		if err != nil {
			ctx.JSON(400, gin.H{"error": "Invalid dateMax format. Use YYYY-MM-DD."})
			return
		}

		searchParams.DateMax = dateMax
	}

	travels, statusCode, err := tc.TravelUseCase.SearchTravel(&searchParams)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, travels)
}

func (tc *TravelController) CancelTravel(ctx *gin.Context) {
	// CancelTravel cancels a travel
	travelID := ctx.Param("id")

	statusCode, err := tc.TravelUseCase.CancelTravel(travelID)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "travel cancelled successfully"})
}
