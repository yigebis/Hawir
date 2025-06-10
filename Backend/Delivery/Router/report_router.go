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
}
