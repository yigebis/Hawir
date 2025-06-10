package Controller

import (
	"Hawir/UseCase"

	"github.com/gin-gonic/gin"
)

type ReportController struct {
	ReportUseCase UseCase.IReportUseCase
}

func NewReportController(reportUseCase UseCase.IReportUseCase) *ReportController {
	return &ReportController{
		ReportUseCase: reportUseCase,
	}
}

func (rc *ReportController) GetBookHeatMap(ctx *gin.Context) {
	// get the agency id from the jwt token
	claims, exists := ctx.Get("agency")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	agencyID := mapClaims["agency_id"].(string)
	bookings, code, err := rc.ReportUseCase.GetBookHeatMap(agencyID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "Failed to retrieve booking heatmap"})
		return
	}

	//bookings is an array of integers representing the number of bookings for each day of all the time
	ctx.JSON(200, bookings)
}
