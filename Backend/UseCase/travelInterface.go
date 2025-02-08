package UseCase

import (
	"Hawir/Domain"
)

type ITravelRepository interface {
	CreateTravel(travel *Domain.Travel) error
	EditTravel(travel *Domain.Travel) error
	ViewTravelById(id string) (*Domain.Travel, error)
	ViewTravelsByAgencyId(agencyId string) ([]Domain.Travel, error)
}
