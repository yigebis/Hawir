package UseCase

import "Hawir/Domain"

type IDestinationUseCase interface {
	AddDestination(destination *Domain.Destination) (int, error)
	EditDestination(destination *Domain.Destination) (int, error)
	GetDestinationById(id string) (*Domain.Destination, int, error)
	GetAllDestinations() (*[]Domain.Destination, int, error)
	DeleteDestination(id string) (int, error)
	AddStations(destinationId string, stations *[]string) (int, error)

	GetDestinationDetailsByID(id string) (*Domain.DestinationDetails, int, error)
	EditDestinationDetails(destinationDetails *Domain.DestinationDetails) (int, error)
	// GetAllDestinations(limit, skip int) (*[]Domain.Destination, int, error)

}

type IDestinationRepository interface {
	AddDestination(destination *Domain.Destination) (string, error)
	InitializeDestinationDetails(id string) error
	DeleteDestination(id string) error
	GetDestinationByID(id string) (*Domain.Destination, error)
	GetDestinationByName(name string) (*Domain.Destination, error)
	GetDestinationDetailsByID(id string) (*Domain.DestinationDetails, error)
	EditDestination(destination *Domain.Destination) error
	EditDestinationDetails(destinationDetails *Domain.DestinationDetails) error
	GetAllDestinations() (*[]Domain.Destination, error)
	UpdateStations(string, *map[string]bool) error

	// GetAllDestinations(limit, skip int) (*[]Domain.Destination, int, error)
}
