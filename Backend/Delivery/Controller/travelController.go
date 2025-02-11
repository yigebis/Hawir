package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"

	"github.com/gin-gonic/gin"
)

type TravelController struct {
	TravelUseCase *UseCase.TravelUseCase
}

func NewTravelController() *TravelController {
	return &TravelController{}
}

func (tc *TravelController) PostTravel(ctx *gin.Context) {
	travel := Domain.Travel{}

	err := ctx.ShouldBindJSON(&travel)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := tc.TravelUseCase.CreateTravel(&travel)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
	}

	ctx.JSON(code, gin.H{"message": "Travel created successfully"})
}
