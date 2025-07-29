package UseCase

import (
	"Hawir/Domain"
	"fmt"
	"time"
)

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

	result := make([]int, totalDays)
	for i := 0; i < totalDays; i++ {
		current := startDate.AddDate(0, 0, i).Format("2006-01-02")
		if _, exists := (*dateCounts)[current]; !exists {
			(*dateCounts)[current] = 0
		}
		result[i] = (*dateCounts)[current]
	}

	return &result, 0, nil
}

func (ru *ReportUseCase) GetActiveTravelersCount(agencyID string) (*Domain.ActiveTravelersCount, int, error) {
	result, err := ru.ReportRepository.GetActiveTravelersCount(agencyID)
	if err != nil {
		code, err := ru.ErrorService.InternalServer()
		return nil, code, err
	}
	code, err := ru.ErrorService.NoError()
	return result, code, err
}

func (ru *ReportUseCase) GetTopFiveDestinations(agencyID string) (*[]Domain.TopDestinationReportItem, int, error) { // CHANGED RETURN TYPE
    // Call the repository method, which now returns *[]Repository.TopDestinationReportItem
	result, err := ru.ReportRepository.GetTopFiveDestinations(agencyID)
	if err != nil {
		code, err := ru.ErrorService.InternalServer()
		return nil, code, err
	}

	code, err := ru.ErrorService.NoError()
	return result, code, err
}

func (ru *ReportUseCase) GetTripHeatMap(agencyID string) (*[]int, int, error) {
	tripCounts, err := ru.ReportRepository.GetTripHeatMap(agencyID)

	if err != nil {
		code, err := ru.ErrorService.InternalServer()
		return nil, code, err
	}

	// start date is Jan 1st of 2025
	startDate := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	// total days is current date minus start date plus 1
	currentDate := time.Now().UTC()
	totalDays := int(currentDate.Sub(startDate).Hours()/24) + 1

	result := make([]int, totalDays)
	for i := 0; i < totalDays; i++ {
		current := startDate.AddDate(0, 0, i).Format("2006-01-02")
		if _, exists := (*tripCounts)[current]; !exists {
			(*tripCounts)[current] = 0
		}
		result[i] = (*tripCounts)[current]
	}

	code, err := ru.ErrorService.NoError()
	return &result, code, err
}

func (ru *ReportUseCase) GetRevenueReport(agencyID string) (*[]int, int, error) {
	revenueCounts, err := ru.ReportRepository.GetRevenueReport(agencyID)
	if err != nil {
		code, err := ru.ErrorService.InternalServer()
		return nil, code, err
	}

	// start date is Jan 1st of 2025
	startDate := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	// total days is current date minus start date plus 1
	currentDate := time.Now().UTC()
	totalDays := int(currentDate.Sub(startDate).Hours()/24) + 1

	result := make([]int, totalDays)
	for i := 0; i < totalDays; i++ {
		current := startDate.AddDate(0, 0, i).Format("2006-01-02")
		if _, exists := (*revenueCounts)[current]; !exists {
			(*revenueCounts)[current] = 0
		}
		result[i] = (*revenueCounts)[current]
		fmt.Println(result[i])
	}

	code, err := ru.ErrorService.NoError()
	return &result, code, err
}

func (ru *ReportUseCase) GetNewCustomersReport(agencyID string) (*[]int, int, error) {
	newCustomersCountsMap, err := ru.ReportRepository.GetNewCustomersReport(agencyID)
	if err != nil {
		code, err := ru.ErrorService.InternalServer()
		return nil, code, err
	}

	// Calculate total days from Jan 1st of the current year up to the current date
	currentYear := time.Now().Year()
	startDate := time.Date(currentYear, time.January, 1, 0, 0, 0, 0, time.UTC)
	currentDate := time.Now().UTC()
    // Add 1 because Sub() counts difference, we need inclusive days
	totalDays := int(currentDate.Sub(startDate).Hours()/24) + 1

	// Initialize the result slice with zeros for all days
	result := make([]int, totalDays) // FIX: Initialize slice with correct length

	// Populate the result slice using data from the map
	// Iterate through the days of the year, filling in counts from the map
	for i := 0; i < totalDays; i++ {
		date := startDate.AddDate(0, 0, i).Format("2006-01-02")
		// Check if the date exists in the map
		if count, exists := (*newCustomersCountsMap)[date]; exists {
			result[i] = count // Assign the count if found
		}
		// If not found, it remains 0 due to `make([]int, totalDays)` initialization
	}
    fmt.Printf("UseCase New Customers Result array: %v\n", result) // Debug print

	code, err := ru.ErrorService.NoError()
	return &result, code, err
}

func (ru *ReportUseCase) GetTotalCustomersCount(agencyID string) (*Domain.ActiveTravelersCount, int, error) {
	result, err := ru.ReportRepository.GetTotalCustomersCount(agencyID)
	if err != nil {
		code, err := ru.ErrorService.InternalServer()
		return nil, code, err
	}
	code, err := ru.ErrorService.NoError()
	return result, code, err
}
