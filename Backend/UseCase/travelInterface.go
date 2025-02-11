package UseCase

import (
	"Hawir/Domain"
)

type ITravelUseCase interface {
	CreateTravel(travel *Domain.Travel) (int, error)
	EditTravel(travel *Domain.Travel) (int, error)
	ViewTravelById(id string) (*Domain.Travel, int, error)
	ViewTravelsByAgencyId(agencyId string) ([]Domain.Travel, int, error)
	// SearchTravel(travel *Domain.Travel) ([]Domain.Travel, int, error)
	// CancelTravel(travel *Domain.Travel) (int, error)
}

type ITravelRepository interface {
	CreateTravel(travel *Domain.Travel) error
	EditTravel(travel *Domain.Travel) error
	ViewTravelById(id string) (*Domain.Travel, error)
	ViewTravelsByAgencyId(agencyId string) ([]Domain.Travel, error)
}
