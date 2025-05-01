package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func (dc *DestinationController) GetDestinationByID(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing destination ID"})
		return
	}

	destination, statusCode, err := dc.DestinationUseCase.GetDestinationById(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, destination)
}

func (dc *DestinationController) GetAllDestinations(ctx *gin.Context) {
	destinations, statusCode, err := dc.DestinationUseCase.GetAllDestinations()
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, destinations)
}

func (dc *DestinationController) EditDestination(ctx *gin.Context) {
	id := ctx.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	destination := Domain.Destination{}
	destination.ID = objID

	err = ctx.ShouldBindJSON(&destination)
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

func (dc *DestinationController) DeleteDestination(ctx *gin.Context) {
	id := ctx.Param("id")

	statusCode, err := dc.DestinationUseCase.DeleteDestination(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "destination deleted successfully"})
}

func (dc *DestinationController) AddDestinationStations(ctx *gin.Context) {
	id := ctx.Param("id")
	stations := Domain.AddStationsRequest{}
	err := ctx.ShouldBindJSON(&stations)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	if len(stations.Stations) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "no stations provided"})
		return
	}

	statusCode, err := dc.DestinationUseCase.AddStations(id, &stations.Stations)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "stations added successfully"})
}

func (dc *DestinationController) GetDestinationDetailsByID(ctx *gin.Context) {
	id := ctx.Param("id")
	detail, statusCode, err := dc.DestinationUseCase.GetDestinationDetailsByID(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, detail)
}

func (dc *DestinationController) EditDestinationDetails(ctx *gin.Context) {
	destinationDetails := Domain.DestinationDetails{}

	err := ctx.ShouldBindJSON(&destinationDetails)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	if err := dc.V.Struct(destinationDetails); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload", "details": err.Error()})
		return
	}

	statusCode, err := dc.DestinationUseCase.EditDestinationDetails(&destinationDetails)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "destination details edited successfully"})
}

func (dc *DestinationController) ViewAllDestinationDetails(ctx *gin.Context) {
	// 	// Parse query parameters for pagination
	// 	page, err := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	// 	if err != nil || page < 1 {
	// 		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid page number"})
	// 		return
	// 	}

	// 	limit, err := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	// 	if err != nil || limit < 1 {
	// 		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit number"})
	// 		return
	// 	}

	// 	// Calculate the skip value
	// 	skip := (page - 1) * limit

	// 	// Fetch paginated destinations from the use case
	// 	destinations, total, err := dc.DestinationUseCase.ViewAllDestinations(limit, skip)
	// 	if err != nil {
	// 		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	// 		return
	// 	}

	// 	// Return paginated response
	// 	ctx.JSON(http.StatusOK, gin.H{
	// 		"data":       destinations,
	// 		"page":       page,
	// 		"limit":      limit,
	// 		"total":      total,
	// 		"totalPages": (total + limit - 1) / limit, // Calculate total pages
	// 	})
}
