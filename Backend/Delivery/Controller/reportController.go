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

func (rc *ReportController) GetActiveTravelersCount(ctx *gin.Context) {
	// get the agency id from the jwt token
	claims, exists := ctx.Get("agency")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	agencyID := mapClaims["agency_id"].(string)
	result, code, err := rc.ReportUseCase.GetActiveTravelersCount(agencyID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "Failed to retrieve active travelers count"})
		return
	}

	ctx.JSON(200, result)
}

func (rc *ReportController) GetTopFiveDestinations(ctx *gin.Context) {
	// get the agency id from the jwt token
	claims, exists := ctx.Get("agency")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	agencyID := mapClaims["agency_id"].(string)
	result, code, err := rc.ReportUseCase.GetTopFiveDestinations(agencyID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "Failed to retrieve top five destinations"})
		return
	}

	ctx.JSON(200, result)
}

func (rc *ReportController) GetTripHeatMap(ctx *gin.Context) {
	// get the agency id from the jwt token
	claims, exists := ctx.Get("agency")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	agencyID := mapClaims["agency_id"].(string)
	trips, code, err := rc.ReportUseCase.GetTripHeatMap(agencyID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "Failed to retrieve trip heatmap"})
		return
	}

	// trips is an array of integers representing the number of trips for each day of all the time
	ctx.JSON(200, trips)
}

func (rc *ReportController) GetRevenueReport(ctx *gin.Context) {
	// get the agency id from the jwt token
	claims, exists := ctx.Get("agency")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	agencyID := mapClaims["agency_id"].(string)
	revenueReport, code, err := rc.ReportUseCase.GetRevenueReport(agencyID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "Failed to retrieve revenue report"})
		return
	}

	ctx.JSON(200, revenueReport)
}

func (rc *ReportController) GetNewCustomersReport(ctx *gin.Context) {
	// get the agency id from the jwt token
	claims, exists := ctx.Get("agency")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	agencyID := mapClaims["agency_id"].(string)
	newCustomersReport, code, err := rc.ReportUseCase.GetNewCustomersReport(agencyID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "Failed to retrieve new customers report"})
		return
	}

	ctx.JSON(200, newCustomersReport)
}
