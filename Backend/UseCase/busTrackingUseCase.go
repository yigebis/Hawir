package UseCase

import (
	"Hawir/Domain"
)

type BusTrackingUseCase struct {
	BusTrackingRepository IBusTrackingRepository
	ErrorService          IErrorService
}

func NewBusTrackingUseCase(repo IBusTrackingRepository, es IErrorService) IBusTrackingUseCase {
	return &BusTrackingUseCase{
		BusTrackingRepository: repo,
		ErrorService:          es,
	}
}

func (btuc *BusTrackingUseCase) SaveBusTracking(tracking *Domain.BusTracking) (int, error) {
	err := btuc.BusTrackingRepository.SaveBusTracking(tracking)
	if err != nil {
		return btuc.ErrorService.InternalServer()
	}
	return btuc.ErrorService.NoError()
}
