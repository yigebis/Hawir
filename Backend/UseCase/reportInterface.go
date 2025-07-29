package UseCase

import "Hawir/Domain"

// "Hawir/Domain"

type IReportUseCase interface {
	GetBookHeatMap(agencyID string) (*[]int, int, error)
	GetActiveTravelersCount(agencyID string) (*Domain.ActiveTravelersCount, int, error)
	GetTopFiveDestinations(agencyID string) (*[]Domain.TopDestinationReportItem, int, error)
	GetTripHeatMap(agencyID string) (*[]int, int, error)
	GetRevenueReport(agencyID string) (*[]int, int, error)
	GetNewCustomersReport(agencyID string) (*[]int, int, error)
	GetTotalCustomersCount(agencyID string) (*Domain.ActiveTravelersCount, int, error)
}

type IReportRepository interface {
	GetBookHeatMap(agencyID string) (*map[string]int, error)
	GetActiveTravelersCount(agencyID string) (*Domain.ActiveTravelersCount, error)
	GetTopFiveDestinations(agencyID string) (*[]Domain.TopDestinationReportItem, error)
	GetTripHeatMap(agencyID string) (*map[string]int, error)
	GetRevenueReport(agencyID string) (*map[string]int, error)
	GetNewCustomersReport(agencyID string) (*map[string]int, error)
	GetTotalCustomersCount(agencyID string) (*Domain.ActiveTravelersCount, error)
}
