package UseCase

import "Hawir/Domain"

type IBusTrackingUseCase interface {
	SaveBusTracking(tracking *Domain.BusTracking) (int, error)
}

type IBusTrackingRepository interface {
	SaveBusTracking(tracking *Domain.BusTracking) error
}
