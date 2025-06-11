package UseCase

import (
	"Hawir/Domain"
	"fmt"
	"log"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TravelUseCase struct {
	TravelRepo          ITravelRepository
	TravelStatsRepo     ITravelStatsRepository
	AgencyRepo          IAgencyRepository
	DriverRepo          IDriverRepository
	ErrorService        IErrorService
	BookingRepository   IBookingRepository
	NotificationService INotificationUseCase
	TravelRatingRepo    ITravelRatingRepository
	BusRepo             IBusRepository // Assuming you have a bus repository interface
}

func NewTravelUseCase(travelRepo ITravelRepository, travelStatsRepo ITravelStatsRepository, agencyRepo IAgencyRepository, driverRepo IDriverRepository, errorService IErrorService, bookingRepo IBookingRepository, notificationService INotificationUseCase, travelRating ITravelRatingRepository) ITravelUseCase {
	return &TravelUseCase{
		TravelRepo:          travelRepo,
		TravelStatsRepo:     travelStatsRepo,
		AgencyRepo:          agencyRepo,
		DriverRepo:          driverRepo,
		ErrorService:        errorService,
		BookingRepository:   bookingRepo,
		NotificationService: notificationService,
		TravelRatingRepo:    travelRating,
	}
}

func (tuc *TravelUseCase) CheckDriverAvailability(driverID string, plannedStartTime time.Time) (int, error) {
	// get the driver by ID
	driver, err := tuc.DriverRepo.GetDriverByID(driverID)
	if err != nil {
		code, err := tuc.ErrorService.DriverNotFound()
		return code, err
	}

	if len(driver.CurrentTrips) == 0 {
		code, err := tuc.ErrorService.NoError()
		return code, err
	}

	type AvailabilityError struct {
		Err  error
		Code int
	}

	// check for conflicts concurrently
	resultCh := make(chan AvailabilityError, len(driver.CurrentTrips))
	var wg sync.WaitGroup

	for _, tripID := range driver.CurrentTrips {
		wg.Add(1)
		go func(tripID string) {
			defer wg.Done()
			// get the estimated arrival time of the trip
			tripDetails, err := tuc.TravelRepo.ViewTravelById(tripID)
			if err != nil {
				code, err := tuc.ErrorService.InternalServer()
				resultCh <- AvailabilityError{Err: err, Code: code}
				return
			}
			// if the estimated arrival time of the last trip is after the planned start time of the new trip,
			// then the driver is available
			if tripDetails.EstArrivalTime.After(plannedStartTime) {
				code, err := tuc.ErrorService.DriverBusy()
				resultCh <- AvailabilityError{Err: err, Code: code}
				return
			}
		}(tripID)
	}

	go func() {
		wg.Wait()
		close(resultCh)
	}()

	for result := range resultCh {
		if result.Err != nil {
			return result.Code, result.Err
		}
	}

	code, err := tuc.ErrorService.NoError()
	return code, err
}

func (tuc *TravelUseCase) CheckBusAvailability(busID string, plannedStartTime time.Time) (int, error) {
	// get the bus by ID
	bus, err := tuc.BusRepo.GetBusByID(busID)
	if err != nil {
		code, err := tuc.ErrorService.BusNotFound()
		return code, err
	}

	if len(bus.CurrentTrips) == 0 {
		code, err := tuc.ErrorService.NoError()
		return code, err
	}

	type AvailabilityError struct {
		Err  error
		Code int
	}

	// check for conflicts concurrently
	resultCh := make(chan AvailabilityError, len(bus.CurrentTrips))
	var wg sync.WaitGroup

	for _, tripID := range bus.CurrentTrips {
		wg.Add(1)
		go func(tripID string) {
			defer wg.Done()
			// get the estimated arrival time of the trip
			tripDetails, err := tuc.TravelRepo.ViewTravelById(tripID)
			if err != nil {
				code, err := tuc.ErrorService.InternalServer()
				resultCh <- AvailabilityError{Err: err, Code: code}
				return
			}
			// if the estimated arrival time of the last trip is after the planned start time of the new trip,
			// then the driver is available
			if tripDetails.EstArrivalTime.After(plannedStartTime) {
				code, err := tuc.ErrorService.BusBusy()
				resultCh <- AvailabilityError{Err: err, Code: code}
				return
			}
		}(tripID)
	}

	go func() {
		wg.Wait()
		close(resultCh)
	}()

	for result := range resultCh {
		if result.Err != nil {
			return result.Code, result.Err
		}
	}

	code, err := tuc.ErrorService.NoError()
	return code, err
}

func (tuc *TravelUseCase) AssignDriver(driverID string, travelID string) (int, error) {
	err := tuc.DriverRepo.AssignTrip(driverID, travelID)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}

	return tuc.ErrorService.NoError()
}

func (tuc *TravelUseCase) AssignBus(busID, travelID string) (int, error) {
	err := tuc.BusRepo.AssignTrip(busID, travelID)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}

	return tuc.ErrorService.NoError()
}

func (tuc *TravelUseCase) TravelValidation(travel *Domain.Travel) (int, error) {
	if travel.Price < 0 {
		return tuc.ErrorService.InvalidPrice()
	}
	if travel.PlannedStartTime.Unix() < time.Now().Unix() {
		return tuc.ErrorService.InvalidPlannedStartTime()
	}
	if travel.EstArrivalTime.Unix() < travel.PlannedStartTime.Unix() {
		return tuc.ErrorService.InvalidEstArrivalTime()
	}

	travel.ActualStartTime = time.Time{}
	travel.ActualArrivalTime = time.Time{}

	return 200, nil
}

func (tuc *TravelUseCase) CreateTravel(travel *Domain.Travel) (int, error) {
	code, err := tuc.TravelValidation(travel)
	if err != nil {
		return code, err
	}
	//check if the agency id exists
	exists, err := tuc.AgencyRepo.CheckAgencyByUniqueID(travel.AgencyId)
	if err != nil {
		fmt.Println(err.Error())
		return tuc.ErrorService.InternalServer()
	}
	if !exists {
		return tuc.ErrorService.AgencyNotFound()
	}

	travel.PostTime = time.Now()
	travel.LastModTime = travel.PostTime
	travel.Status = "upcoming"
	travel.ActualStartTime = travel.PlannedStartTime
	travel.ActualArrivalTime = travel.EstArrivalTime

	// check if the driver can be assigned
	if travel.DriverID != "" {
		code, err := tuc.CheckDriverAvailability(travel.DriverID, travel.PlannedStartTime)
		if err != nil {
			return code, err
		}
	}

	// check if the bus can be assigned

	travelID, err := tuc.TravelRepo.CreateTravel(travel)
	if err != nil {
		fmt.Println(err.Error())
		return tuc.ErrorService.InternalServer()
	}

	if travel.DriverID != "" {
		code, err = tuc.AssignDriver(travel.DriverID, travelID)
		if err != nil {
			return code, err
		}
	}

	if travel.BusRef != "" {
		code, err = tuc.AssignBus(travel.BusRef, travelID)
		if err != nil {
			return code, err
		}
	}

	var travelStats = Domain.TravelStats{
		TravelID:      travelID,
		Seats:         make([]bool, travel.TotalSeats),
		ReservedCount: 0,
		AvgRating:     0,
		RatedBy:       0,
	}

	err = tuc.TravelStatsRepo.CreateTravelStats(&travelStats)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}

	var travelRating = Domain.TravelRating{
		TravelID:         travelID,
		Rating:           0,
		TotalRatingSum:   0,
		TotalRatingCount: 0,
	}
	err = tuc.TravelRatingRepo.CreateTravelRating(&travelRating)
	if err != nil {
		return tuc.ErrorService.InternalServer()
	}

	return tuc.ErrorService.NoError()
}

// editing a travel
func (tuc *TravelUseCase) EditTravel(travel *Domain.Travel) (int, error) {
	// get the existing travel by ID
	existingTravel, err := tuc.TravelRepo.ViewTravelById(travel.ID.Hex())
	if err != nil {
		return tuc.ErrorService.TravelNotFound()
	}

	code, err := tuc.TravelValidation(travel)
	if err != nil {
		return code, err
	}

	travel.LastModTime = time.Now()

	err = tuc.TravelRepo.EditTravel(travel)
	if err != nil {
		return tuc.ErrorService.TravelNotFound()
	}

	// check if the driver and the bus are available
	isNewDriver := travel.DriverID != "" && travel.DriverID != existingTravel.DriverID
	if isNewDriver {
		code, err = tuc.CheckDriverAvailability(travel.DriverID, travel.PlannedStartTime)
		if err != nil {
			return code, err
		}
	}

	isNewBus := travel.BusRef != "" && travel.BusRef != existingTravel.BusRef
	if isNewBus {
		code, err = tuc.CheckBusAvailability(travel.BusRef, travel.PlannedStartTime)
		if err != nil {
			return code, err
		}
	}

	// remove the travel from the existing driver's current trips
	if existingTravel.DriverID != travel.DriverID && existingTravel.DriverID != "" {
		err = tuc.DriverRepo.RemoveTripFromDriver(existingTravel.DriverID, travel.ID.Hex())
		if err != nil {
			return tuc.ErrorService.InternalServer()
		}
	}

	// remove the travel from the existing bus's current trips
	if existingTravel.BusRef != travel.BusRef && existingTravel.BusRef != "" {
		err = tuc.BusRepo.RemoveTripFromBus(existingTravel.BusRef, travel.ID.Hex())
		if err != nil {
			return tuc.ErrorService.InternalServer()
		}
	}

	// assign driver and bus
	if isNewDriver {
		code, err = tuc.AssignDriver(travel.DriverID, travel.ID.Hex())
		if err != nil {
			return code, err
		}
	}

	if isNewBus {
		code, err = tuc.AssignBus(travel.BusRef, travel.ID.Hex())
		if err != nil {
			return code, err
		}
	}

	return tuc.ErrorService.NoError()
}

// viewing a travel by id
func (tuc *TravelUseCase) ViewTravelById(id string) (*Domain.Travel, int, error) {
	travel, err := tuc.TravelRepo.ViewTravelById(id)
	if err != nil {
		statusCode, err := tuc.ErrorService.TravelNotFound()
		return nil, statusCode, err
	}
	statusCode, err := tuc.ErrorService.NoError()
	return travel, statusCode, err
}

// viewing travels by agency id
func (tuc *TravelUseCase) ViewTravelsByAgencyId(agencyId string) (*[]Domain.Travel, int, error) {
	travels, err := tuc.TravelRepo.ViewTravelsByAgencyId(agencyId)
	if err != nil {
		statusCode, err := tuc.ErrorService.TravelNotFound()
		return nil, statusCode, err
	}

	statusCode, err := tuc.ErrorService.NoError()
	return travels, statusCode, err
}

// searching for travels
func (tuc *TravelUseCase) SearchTravel(searchParams *Domain.SearchParams) (*[]Domain.Travel, int, error) {
	travels, err := tuc.TravelRepo.SearchTravel(searchParams)
	if err != nil {
		code, err := tuc.ErrorService.TravelNotFound()
		return nil, code, err
	}

	code, err := tuc.ErrorService.NoError()
	return travels, code, err
}

func (tuc *TravelUseCase) CancelTravel(travelID string) (int, error) {
	err := tuc.TravelRepo.EditTravelStatus(travelID, "cancelled")
	if err != nil {
		return tuc.ErrorService.TravelNotFound()
	}

	travellerIDs, err := tuc.BookingRepository.GetTravellersIDForTrip(travelID)
	if err != nil {
		return tuc.ErrorService.TravelNotFound()
	}

	if travellerIDs != nil {

		// Create the custom notification object
		notificationTitle := "Travel Booking Cancelled"
		notificationMessage := fmt.Sprintf("Your booking for travel ID %s has been cancelled.", travelID)

		customNotification := &Domain.CustomNotification{
			ID:       primitive.NewObjectID(), // Generate a unique ID for this notification instance
			Title:    notificationTitle,
			Message:  notificationMessage,
			PostTime: time.Now(),                      // Set the post time to now
			Status:   Domain.NotificationStatusUnread, // Set initial status to unread
		}

		_, saveErr := tuc.NotificationService.SaveNotificationsForTraveller(customNotification, *travellerIDs)
		if saveErr != nil {
			log.Printf("error saving cancellation notification for trip %s to travellers: %v", travelID, saveErr)
		}

		if err := tuc.NotificationService.NotifyCancelledBooking(travellerIDs, travelID); err != nil {
			log.Printf("error sending cancellation notifications for trip %s: %v", travelID, err)
			// Decide if the cancellation should be considered a failure if notification fails
			// For now, we'll just log the error and proceed with successful cancellation
		}
	} else {
		log.Println("no travellers found for trip", travelID)
	}

	// delete the current trip from the driver's and bus's current trips if there are any
	trip, err := tuc.TravelRepo.ViewTravelById(travelID)
	if err != nil {
		statusCode, _ := tuc.ErrorService.TravelNotFound()
		return statusCode, err
	}

	if trip.DriverID != "" {
		err = tuc.DriverRepo.RemoveTripFromDriver(trip.DriverID, travelID)
		if err != nil {
			statusCode, _ := tuc.ErrorService.InternalServer()
			return statusCode, err
		}
	}

	if trip.BusRef != "" {
		err = tuc.BusRepo.RemoveTripFromBus(trip.BusRef, travelID)
		if err != nil {
			statusCode, _ := tuc.ErrorService.InternalServer()
			return statusCode, err
		}
	}

	statusCode, _ := tuc.ErrorService.NoError()
	return statusCode, nil
}
