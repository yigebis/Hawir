package UseCase

import "Hawir/Domain"

type IDestinationUseCase interface {
	AddDestination(destination *Domain.Destination) (int, error)
	EditDestination(destination *Domain.Destination) (int, error)
	ViewDestinationById(id string) (*Domain.Destination, int, error)
	ViewAllDestinations(limit, skip int) (*[]Domain.Destination, int, error)
}

type IDestinationRepository interface {
	AddDestination(destination *Domain.Destination) error
	EditDestination(destination *Domain.Destination) error
	ViewDestinationById(id string) (*Domain.Destination, error)
	ViewAllDestinations(limit, skip int) (*[]Domain.Destination, int, error)
}