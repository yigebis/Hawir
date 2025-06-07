package UseCase

import "Hawir/Domain"

type IBusTrackingUseCase interface {
	SaveBusTracking(tracking *Domain.BusTracking) (int, error)
	StartBusTracking(tripID string, driverID string) (int, error)
	StopBusTracking(tripID string, driverID string) (int, error)
}

type IBusTrackingRepository interface {
	SaveBusTracking(tracking *Domain.BusTracking) error
}
