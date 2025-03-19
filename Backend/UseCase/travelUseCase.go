package UseCase

import (
	"Hawir/Domain"
	"time"
)

type TravelUseCase struct {
	TravelRepo      ITravelRepository
	TravelStatsRepo ITravelStatsRepository
	AgencyRepo      IAgencyRepository
	ErrorService    IErrorService
}

func NewTravelUseCase(travelRepo ITravelRepository, travelStatsRepo ITravelStatsRepository, agencyRepo IAgencyRepository, errorService IErrorService) ITravelUseCase {
	return &TravelUseCase{
		TravelRepo:      travelRepo,
		TravelStatsRepo: travelStatsRepo,
		AgencyRepo:      agencyRepo,
		ErrorService:    errorService,
	}
}

func (tuc *TravelUseCase) TravelValidation(travel *Domain.Travel) (int, error) {
	var found = false
	for _, pickupLocation := range travel.PickupLocations {
		if travel.StartLocation == pickupLocation {
			found = true
			break
		}
	}

	if !found {
		return tuc.ErrorService.InvalidStartLocation()
	}

	if travel.Price < 0 {
		return 400, fmt.Errorf("price cannot be negative")
	}
	if travel.PlannedStartTime.Unix() < time.Now().Unix() {
		return 400, fmt.Errorf("planned start time cannot be in the past")
	}
	if travel.EstArrivalTime.Unix() < travel.PlannedStartTime.Unix() {
		return 400, fmt.Errorf("estimated arrival time cannot be before planned start time")
	}

	travel.ActualStartTime = time.Time{}
	travel.ActualArrivalTime = time.Time{}

	return 200, nil
}

func (tuc *TravelUseCase) CreateTravel(travel *Domain.Travel) (int, error) {
	//check if the agency id exists
	exists, err := tuc.AgencyRepo.CheckAgency(travel.AgencyId)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}
	if !exists {
		return tuc.ErrorService.AgencyNotFound()
	}

	travel.PostTime = time.Now()
	travel.LastModTime = travel.PostTime
	travel.Status = "upcoming"

	travelID, err := tuc.TravelRepo.CreateTravel(travel)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}

	var travelStats = Domain.TravelStats{
		TravelID:      travelID,
		Seats:         make([]bool, travel.TotalSeats),
		ReservedCount: 0,
		AvgRating:     0,
		RatedBy:       0,
	}

	err = tuc.TravelStatsRepo.CreateTravelStats(&travelStats)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}

	return tuc.ErrorService.NoError()
}

// editing a travel
func (tuc *TravelUseCase) EditTravel(travel *Domain.Travel) (int, error) {

	code, err := tuc.TravelValidation(travel)
	if err != nil {
		return code, err
	}

	err = tuc.TravelRepo.EditTravel(travel)
	if err != nil {
		return tuc.ErrorService.TravelNotFound()
	}
	return tuc.ErrorService.NoError()
}

// viewing a travel by id
func (tuc *TravelUseCase) ViewTravelById(id string) (*Domain.Travel, int, error) {
	travel, err := tuc.TravelRepo.ViewTravelById(id)
	if err != nil {
		statusCode, err := tuc.ErrorService.TravelNotFound()
		return nil, statusCode, err
	}
	statusCode, err := tuc.ErrorService.NoError()
	return travel, statusCode, err
}

// viewing travels by agency id
func (tuc *TravelUseCase) ViewTravelsByAgencyId(agencyId string) (*[]Domain.Travel, int, error) {
	travels, err := tuc.TravelRepo.ViewTravelsByAgencyId(agencyId)
	if err != nil {
		statusCode, err := tuc.ErrorService.TravelNotFound()
		return nil, statusCode, err
	}

	statusCode, err := tuc.ErrorService.NoError()
	return travels, statusCode, err
}

// searching for travels
func (tuc *TravelUseCase) SearchTravel(searchParams *Domain.SearchParams) (*[]Domain.Travel, int, error) {
	travels, err := tuc.TravelRepo.SearchTravel(searchParams)
	if err != nil {
		code, err := tuc.ErrorService.TravelNotFound()
		return nil, code, err
	}

	code, err := tuc.ErrorService.NoError()
	return travels, code, err
}

// cancelling a travel (agency side)
func (tuc *TravelUseCase) CancelTravel(travelID string) (int, error) {
	err := tuc.TravelRepo.EditTravelStatus(travelID, "cancelled")
	if err != nil {
		return tuc.ErrorService.TravelNotFound()
	}

	return tuc.ErrorService.NoError()
}
