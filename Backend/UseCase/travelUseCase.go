package UseCase

import (
	"Hawir/Domain"
	"fmt"
)

type TravelUseCase struct {
	TravelRepo   ITravelRepository
	ErrorService IErrorService
}

func NewTravelUseCase(travelRepo ITravelRepository, errorService IErrorService) *TravelUseCase {
	return &TravelUseCase{
		TravelRepo:   travelRepo,
		ErrorService: errorService,
	}
}

func (tuc *TravelUseCase) CreateTravel(travel *Domain.Travel) (int, error) {
	//do some validations here
	if travel.AgencyId != "" { // what do we do with the agency ID

	}

	// if travel.Destination == "" {

	// } i dont think we need to check the destinations

	if travel.DriverName != "" {
		// what do we do with the driver name
	}

	err := tuc.TravelRepo.CreateTravel(travel)
	fmt.Println("after!")
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
