package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type ReportRouter struct {
	ReportController Controller.ReportController
}

func NewReportRouter(reportController Controller.ReportController) *ReportRouter {
	return &ReportRouter{
		ReportController: reportController,
	}
}

func (rr *ReportRouter) Run(router *gin.Engine, jwt_string string) {
	router.GET("/agency/reports/book_heatmap", Infrastructure.AgencyMiddleWare(jwt_string), rr.ReportController.GetBookHeatMap)
	router.GET("/agency/reports/active_travelers_count", Infrastructure.AgencyMiddleWare(jwt_string), rr.ReportController.GetActiveTravelersCount)
	router.GET("/agency/reports/top_five_destinations", Infrastructure.AgencyMiddleWare(jwt_string), rr.ReportController.GetTopFiveDestinations)
	router.GET("/agency/reports/trip_heatmap", Infrastructure.AgencyMiddleWare(jwt_string), rr.ReportController.GetTripHeatMap)
	router.GET("/agency/reports/revenue", Infrastructure.AgencyMiddleWare(jwt_string), rr.ReportController.GetRevenueReport)
	router.GET("/agency/reports/new_customers", Infrastructure.AgencyMiddleWare(jwt_string), rr.ReportController.GetNewCustomersReport)
}
