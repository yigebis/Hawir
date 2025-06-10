package UseCase

import "time"

type ReportUseCase struct {
	ReportRepository IReportRepository
	ErrorService     IErrorService
}

func NewReportUseCase(rr IReportRepository, es IErrorService) IReportUseCase {
	return &ReportUseCase{
		ReportRepository: rr,
		ErrorService:     es,
	}
}

func (ru *ReportUseCase) GetBookHeatMap(agencyID string) (*[]int, int, error) {
	// start date is Jan 1st of 2025
	startDate := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	// total days is current date minus start date plus 1
	currentDate := time.Now().UTC()
	totalDays := int(currentDate.Sub(startDate).Hours()/24) + 1

	dateCounts, err := ru.ReportRepository.GetBookHeatMap(agencyID)
	if err != nil {
		code, err := ru.ErrorService.InternalServer()
		return nil, code, err
	}

	result := make([]int, 0, totalDays)
	for i := 0; i < totalDays; i++ {
		current := startDate.AddDate(0, 0, i).Format("2006-01-02")
		result[i] = (*dateCounts)[current]
	}

	return &result, 0, nil
}
