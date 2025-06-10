package UseCase

// "Hawir/Domain"

type IReportUseCase interface {
	GetBookHeatMap(agencyID string) (*[]int, int, error)
}

type IReportRepository interface {
	GetBookHeatMap(agencyID string) (*map[string]int, error)
}
