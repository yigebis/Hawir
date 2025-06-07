package UseCase

import (
	"Hawir/Domain"
	"time"
)

type BusTrackingUseCase struct {
	BusTrackingRepository IBusTrackingRepository
	DriverRepository      IDriverRepository
	TravelRepository      ITravelRepository
	ErrorService          IErrorService
}

func NewBusTrackingUseCase(busTrackingRepo IBusTrackingRepository, driverRepo IDriverRepository, travelRepo ITravelRepository, es IErrorService) IBusTrackingUseCase {
	return &BusTrackingUseCase{
		BusTrackingRepository: busTrackingRepo,
		DriverRepository:      driverRepo,
		TravelRepository:      travelRepo,
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

func (btuc *BusTrackingUseCase) StartBusTracking(tripID string, driverID string) (int, error) {
	// check if the trip exists in the driver's current trips
	driver, err := btuc.DriverRepository.GetDriverByID(driverID)
	if err != nil {
		return btuc.ErrorService.InternalServer()
	}

	isTripValid := false
	for _, trip := range driver.CurrentTrips {
		if trip == tripID {
			isTripValid = true
			break
		}
	}

	if !isTripValid {
		return btuc.ErrorService.TravelNotFound()
	}

	// set the trip's actual start time
	travel, err := btuc.TravelRepository.ViewTravelById(tripID)
	if err != nil {
		return btuc.ErrorService.InternalServer()
	}

	travel.ActualStartTime = time.Now()
	err = btuc.TravelRepository.EditTravel(travel)
	if err != nil {
		return btuc.ErrorService.InternalServer()
	}

	return btuc.ErrorService.NoError()
}

func (btuc *BusTrackingUseCase) StopBusTracking(tripID string, driverID string) (int, error) {
	// check if the trip exists in the driver's current trips
	driver, err := btuc.DriverRepository.GetDriverByID(driverID)
	if err != nil {
		return btuc.ErrorService.InternalServer()
	}

	isTripValid := false
	for _, trip := range driver.CurrentTrips {
		if trip == tripID {
			isTripValid = false
			break
		}
	}

	if !isTripValid {
		return btuc.ErrorService.TravelNotFound()
	}

	// set the trip's actual end time and status
	travel, err := btuc.TravelRepository.ViewTravelById(tripID)
	if err != nil {
		return btuc.ErrorService.InternalServer()
	}
	travel.ActualArrivalTime = time.Now()
	travel.Status = "completed"

	err = btuc.TravelRepository.EditTravel(travel)
	if err != nil {
		return btuc.ErrorService.InternalServer()
	}
	return btuc.ErrorService.NoError()
}
