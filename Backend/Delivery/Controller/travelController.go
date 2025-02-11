package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"

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
		ctx.JSON(400, gin.H{"error" : "invalid request payload"})
		return
	}

	err = tc.V.Struct(travel)
	if err != nil {
		ctx.JSON(400, gin.H{"error" : "invalid request payload"})
		return
	}

	statusCode, err := tc.TravelUseCase.CreateTravel(&travel)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error" : err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message" : "travel created successfully"})
}

func (tc *TravelController) EditTravel(ctx *gin.Context) {
	// EditTravel edits a travel
	travel := Domain.Travel{}

	err := ctx.ShouldBindBodyWithJSON(&travel)
	if err != nil {
		ctx.JSON(400, gin.H{"error" : "invalid request payload"})
		return
	}

	err = tc.V.Struct(travel) // i dont really know what this does!!
	if err != nil {
		ctx.JSON(400, gin.H{"error" : "invalid request payload"})
		return
	}

	statusCode, err := tc.TravelUseCase.EditTravel(&travel)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error" : err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message" : "travel edited successfully"})
}

func (tc *TravelController) ViewTravelById(ctx *gin.Context) {
	// ViewTravelById views a travel by id
	id := ctx.Param("id")

	travel, statusCode, err := tc.TravelUseCase.ViewTravelById(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error" : err.Error()})
		return
	}

	ctx.JSON(statusCode, travel)
}

func (tc *TravelController) ViewTravelsByAgencyId(ctx *gin.Context) {
	// ViewTravelsByAgencyId views travels by agency id
	agencyId := ctx.Param("agencyId")

	travels, statusCode, err := tc.TravelUseCase.ViewTravelsByAgencyId(agencyId)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error" : err.Error()})
		return
	}

	ctx.JSON(statusCode, travels)
}