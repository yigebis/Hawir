package UseCase

import (
	"Hawir/Domain"
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
	//John the implementer

	err := tuc.TravelRepo.CreateTravel(travel)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}
	return tuc.ErrorService.NoError()
}

// editing a travel
func (tuc *TravelUseCase) EditTravel(travel *Domain.Travel) (int, error) {
	//do some validations here
	//John the implementer

	err := tuc.TravelRepo.EditTravel(travel)
	if err != nil {
		return tuc.ErrorService.TravelNotFound()
	}
	return tuc.ErrorService.NoError()
}

// viewing a travel by id
func (tuc *TravelUseCase) ViewTravelById(id string) (*Domain.Travel, int, error) {
	panic("unimplemented")
	//John the implementer
}

// viewing travels by agency id
func (tuc *TravelUseCase) ViewTravelsByAgencyId(agencyId string) ([]Domain.Travel, int, error) {
	travels, err := tuc.TravelRepo.ViewTravelsByAgencyId(agencyId)
	if err != nil {
		statusCode, err := tuc.ErrorService.TravelNotFound()
		return nil, statusCode, err
	}

	statusCode, err := tuc.ErrorService.NoError()
	return travels, statusCode, err
}

// searching for travels
func (tuc *TravelUseCase) SearchTravel(travel *Domain.Travel) ([]Domain.Travel, int, error) {
	panic("unimplemented")
}

// cancelling a travel (agency side)
func (tuc *TravelUseCase) CancelTravel(travel *Domain.Travel) (int, error) {
	panic("unimplemented")
}
