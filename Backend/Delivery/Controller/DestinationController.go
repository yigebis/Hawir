package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type DestinationController struct {
	DestinationUseCase UseCase.IDestinationUseCase
	V                  *validator.Validate
}

func NewDestinationController(duc UseCase.IDestinationUseCase) *DestinationController {
	return &DestinationController{
		DestinationUseCase: duc,
		V:                  validator.New(),
	}
}

func (dc *DestinationController) AddDestination(ctx *gin.Context) {
	var destination = Domain.Destination{}

	err := ctx.ShouldBindBodyWithJSON(&destination)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	statusCode, err := dc.DestinationUseCase.AddDestination(&destination)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "destination added successfully"})
}

func (dc *DestinationController) GetDestinationByID(ctx *gin.Context){
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing destination ID"})
		return
	}

	destination, statusCode, err := dc.DestinationUseCase.ViewDestinationById(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, destination)
	
}

func (dc *DestinationController) EditDestination(ctx *gin.Context){
	destination := Domain.Destination{}

	err := ctx.ShouldBindJSON(&destination)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = dc.V.Struct(destination) 
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload", "details": err.Error()})
		return
	}

	statusCode, err := dc.DestinationUseCase.EditDestination(&destination)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "destination edited successfully"})
}

