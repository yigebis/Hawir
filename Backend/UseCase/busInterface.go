package UseCase

import "Hawir/Domain"

type IBusRepository interface {
	GetBusByID(id string) (*Domain.Bus, error)
	AssignTrip(id string, tripID string) error
	AddBus(bus *Domain.Bus) error
	EditBus(bus *Domain.Bus) error
	GetBusByPlateNumber(plateNumber string) (*Domain.Bus, error)
	GetAllBusesByAgencyID(agencyID string) (*[]Domain.Bus, error)
	RemoveTripFromBus(busID string, tripID string) error
}
