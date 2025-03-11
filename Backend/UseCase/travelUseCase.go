package UseCase

import (
	"Hawir/Domain"
	"time"
)

type TravelUseCase struct {
	TravelRepo   ITravelRepository
	AgencyRepo   IAgencyRepository
	ErrorService IErrorService
}

func NewTravelUseCase(travelRepo ITravelRepository, agencyRepo IAgencyRepository, errorService IErrorService) ITravelUseCase {
	return &TravelUseCase{
		TravelRepo:   travelRepo,
		AgencyRepo:   agencyRepo,
		ErrorService: errorService,
	}
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

	// start location must be in pick up locations
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

	// ensure the travel is afterwards
	if travel.PlannedStartTime.Unix() < time.Now().Unix() {
		return tuc.ErrorService.InvalidPlannedStartTime()
	}

	// ensure the trave's arrival time plan is after the start time
	if travel.EstArrivalTime.Unix() < travel.PlannedStartTime.Unix() {
		return tuc.ErrorService.InvalidEstArrivalTime()
	}

	travel.PostTime = time.Now()
	travel.LastModTime = travel.PostTime
	travel.Status = "upcoming"

	err = tuc.TravelRepo.CreateTravel(travel)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}
	return tuc.ErrorService.NoError()
}

// editing a travel
func (tuc *TravelUseCase) EditTravel(travel *Domain.Travel) (int, error) {
	//do some validations here
	if travel.AgencyId != "" {
	} // what do we do with the agency ID
	if travel.Destination != "" {
	} // what do we do with the destination
	if travel.DriverName != "" {
	} // what do we do with the driver name

	err := tuc.TravelRepo.EditTravel(travel)
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
