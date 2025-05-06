package UseCase

import (
	"Hawir/Domain"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TravelUseCase struct {
	TravelRepo      ITravelRepository
	TravelStatsRepo ITravelStatsRepository
	AgencyRepo      IAgencyRepository
	ErrorService    IErrorService
	BookingRepository IBookingRepository
	NotificationService INotificationUseCase
}

func NewTravelUseCase(travelRepo ITravelRepository, travelStatsRepo ITravelStatsRepository, agencyRepo IAgencyRepository, errorService IErrorService, bookingRepo IBookingRepository, notificationService INotificationUseCase) ITravelUseCase {
	return &TravelUseCase{
		TravelRepo:      travelRepo,
		TravelStatsRepo: travelStatsRepo,
		AgencyRepo:      agencyRepo,
		ErrorService:    errorService,
		BookingRepository: bookingRepo,
		NotificationService: notificationService,
	}
}

func (tuc *TravelUseCase) TravelValidation(travel *Domain.Travel) (int, error) {
	var found = false
	for _, pickupLocation := range travel.PickupLocations {
		if travel.StartLocation == pickupLocation {
			found = true
			break
		}
	}

	if !found {
		return tuc.ErrorService.InvalidStartLocation()
	}

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
	//check if the agency id exists
	exists, err := tuc.AgencyRepo.CheckAgency(travel.AgencyId)
	if err != nil {
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

	travelID, err := tuc.TravelRepo.CreateTravel(travel)
	if err != nil {
		return tuc.ErrorService.InternalServer()
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

	return tuc.ErrorService.NoError()
}

// editing a travel
func (tuc *TravelUseCase) EditTravel(travel *Domain.Travel) (int, error) {

	code, err := tuc.TravelValidation(travel)
	if err != nil {
		return code, err
	}

	travel.ActualStartTime = travel.PlannedStartTime
	travel.ActualArrivalTime = travel.EstArrivalTime

	err = tuc.TravelRepo.EditTravel(travel)
	if err != nil {
		return tuc.ErrorService.TravelNotFound()
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

// cancelling a travel (agency side)
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
			ID: primitive.NewObjectID(), // Generate a unique ID for this notification instance
			Title: notificationTitle,
			Message: notificationMessage,
			PostTime: time.Now(), // Set the post time to now
			Status: Domain.NotificationStatusUnread, // Set initial status to unread
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

	statusCode, _ := tuc.ErrorService.NoError()
	return statusCode, nil
}
