package UseCase

import (
	"Hawir/Domain"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type BookingUseCase struct {
	BookingRepo  IBookingRepository
	TravelRepo   ITravelRepository
	ErrorService IErrorService
}

func NewBookingUseCase(bookingRepo IBookingRepository, travelRepo ITravelRepository, errorService IErrorService) IBookingUseCase {
	return &BookingUseCase{
		BookingRepo:  bookingRepo,
		ErrorService: errorService,
		TravelRepo:   travelRepo,
	}
}

// this will make the seat reserved for 5 minutes
func (buc *BookingUseCase) ChooseSeat(seat *Domain.Seat) (int, error) {
	// find the travel
	travel, err := buc.TravelRepo.ViewTravelById(seat.TravelID)
	if err != nil {
		return buc.ErrorService.TravelNotFound()
	}

	// check if the seat number is valid
	if seat.SeatNo < 0 || seat.SeatNo >= travel.TotalSeats {
		return buc.ErrorService.IncorrectSeatNumber()
	}

	// check whether the seat has been booked/chosen or not
	isReserved, err := buc.BookingRepo.CheckSeat(seat.TravelID, int(seat.SeatNo))
	if err != nil {
		return buc.ErrorService.InternalServer()
	}
	if isReserved {
		return buc.ErrorService.SeatReserved()
	}

	// reserve it for some minutes
	seatReservationSpan, err := strconv.Atoi(os.Getenv("SEAT_RESERVATION_SPAN"))
	if err != nil {
		return buc.ErrorService.InternalServer()
	}

	maxTime := time.Now().Add(time.Duration(seatReservationSpan))
	seat.MaxTime = maxTime

	err = buc.BookingRepo.ChooseSeat(seat)
	if err != nil {
		return buc.ErrorService.InternalServer()
	}

	return buc.ErrorService.NoError()
}

func (buc *BookingUseCase) UnchooseSeat(seat *Domain.Seat) (int, error) {
	// check if the seat exists
	reserved, err := buc.BookingRepo.CheckSeat(seat.TravelID, seat.SeatNo)
	if err != nil {
		return buc.ErrorService.InternalServer()
	}
	if !reserved {
		return buc.ErrorService.SeatNotChosen()
	}

	// remove the seat
	err = buc.BookingRepo.FreeSeat(seat.TravelID, seat.SeatNo)
	if err != nil {
		return buc.ErrorService.InternalServer()
	}

	return buc.ErrorService.NoError()
}

func (buc *BookingUseCase) BookAndPayFromAgency(booking *Domain.Booking) (*Domain.Booking, int, error) {
	// check whether the seat has been choosen by the traveler or not
	_, err := buc.BookingRepo.GetSeatByTravelerID(booking.TravelerID, booking.TravelID)
	if err != nil {
		// Return nil booking on error
		statusCode, err := buc.ErrorService.SeatNotChosen()
		return nil, statusCode, err
	}

	// delete the seat
	err = buc.BookingRepo.DeleteSeat(booking.TravelerID, booking.TravelID)
	if err != nil {
		// Return nil booking on error
		statusCode, err := buc.ErrorService.SeatNotChosen()
		return nil, statusCode, err
	}

	booking.PaymentRef = Domain.Payment{}
	// Generate a unique PaymentRef for this booking
	UUID := fmt.Sprintf("hw-booking-%s", uuid.New().String())

	booking.PaymentRef.CurrentPaymentRef = UUID
	booking.PaymentRef.PaymentSuccessful = true
	booking.PaymentRef.FailedPaymentRef = []string{}
	booking.BookingRef = UUID
	booking.Status = Domain.BookingStatusPaid
	booking.NotificationSent = false
	booking.PaymentType = "inperson"

	// Set the booking time to the current time
	booking.BookTime = time.Now()
	booking.PayTime = time.Now()
	print("before\n")
	err = buc.BookingRepo.Book(booking)
	if err != nil {
		// Return nil booking on error
		statusCode, err := buc.ErrorService.SeatNotChosen()
		return nil, statusCode, err
	}

	fmt.Println("after booking")
	booking, err = buc.BookingRepo.GetBookingByBookingRef(booking.BookingRef)
	if err != nil {
		statusCode, err := buc.ErrorService.BookingNotFound()
		return nil, statusCode, err
	}

	// Return the booking object after successful saving
	statusCode, err := buc.ErrorService.NoError()
	return booking, statusCode, err
}

// this will make the seat reserved for 30 minutes
func (buc *BookingUseCase) Book(booking *Domain.Booking) (*Domain.Booking, int, error) {
	// check whether the seat has been choosen by the traveler or not
	_, err := buc.BookingRepo.GetSeatByTravelerID(booking.TravelerID, booking.TravelID)
	if err != nil {
		// Return nil booking on error
		statusCode, err := buc.ErrorService.SeatNotChosen()
		return nil, statusCode, err
	}

	// delete the seat
	err = buc.BookingRepo.DeleteSeat(booking.TravelerID, booking.TravelID)
	if err != nil {
		// Return nil booking on error
		statusCode, err := buc.ErrorService.SeatNotChosen()
		return nil, statusCode, err
	}

	// reserve it for some minutes
	bookReservationSpan, err := strconv.Atoi(os.Getenv("BOOK_RESERVATION_SPAN"))
	if err != nil {
		// Return nil booking on error
		statusCode, err := buc.ErrorService.SeatNotChosen()
		return nil, statusCode, err
	}

	maxTime := time.Now().Add(time.Duration(bookReservationSpan) * time.Second) // Assuming span is in minutes
	booking.BookTimeLimit = maxTime

	booking.PaymentRef = Domain.Payment{}
	// Generate a unique PaymentRef for this booking
	UUID := fmt.Sprintf("hw-booking-%s", uuid.New().String())

	booking.PaymentRef.CurrentPaymentRef = UUID
	booking.PaymentRef.PaymentSuccessful = false
	booking.PaymentRef.FailedPaymentRef = []string{}
	booking.BookingRef = UUID
	booking.Status = Domain.BookingStatusPending
	booking.NotificationSent = false
	booking.PaymentType = "online"

	// Set the booking time to the current time
	booking.BookTime = time.Now()
	err = buc.BookingRepo.Book(booking)
	if err != nil {
		// Return nil booking on error
		statusCode, err := buc.ErrorService.SeatNotChosen()
		return nil, statusCode, err
	}

	fmt.Println("after booking")
	booking, err = buc.BookingRepo.GetBookingByBookingRef(booking.BookingRef)
	if err != nil {
		statusCode, err := buc.ErrorService.BookingNotFound()
		return nil, statusCode, err
	}

	// Return the booking object after successful saving
	statusCode, err := buc.ErrorService.NoError()
	return booking, statusCode, err
}

func (buc *BookingUseCase) CancelBook(bookingID string) (int, error) {
	err := buc.BookingRepo.CancelBook(bookingID)
	if err != nil {
		statusCode, err := buc.ErrorService.BookingNotFound()
		return statusCode, err
	}

	statusCode, err := buc.ErrorService.NoError()
	return statusCode, err
}

func (buc *BookingUseCase) EditBook(booking *Domain.Booking) (int, error) {
	err := buc.BookingRepo.EditBook(booking)
	if err != nil {
		return buc.ErrorService.BookingNotFound()
	}

	return buc.ErrorService.NoError()
}

func (buc *BookingUseCase) GetBooking(bookingID string) (*Domain.Booking, int, error) {
	booking, err := buc.BookingRepo.GetBooking(bookingID)
	if err != nil {
		statusCode, err := buc.ErrorService.BookingNotFound()
		return nil, statusCode, err
	}

	statusCode, err := buc.ErrorService.NoError()
	return booking, statusCode, err
}

func (buc *BookingUseCase) GetAllBookings(travelID string) (*[]Domain.TravelBookings, int, error) {
	bookings, err := buc.BookingRepo.GetAllBookings(travelID)
	if err != nil {
		statusCode, err := buc.ErrorService.TravelNotFound()
		return nil, statusCode, err
	}

	statusCode, err := buc.ErrorService.NoError()
	return bookings, statusCode, err
}

func (buc *BookingUseCase) GetBookingsForTraveler(travelerID string) (*[]Domain.Booking, int, error) {
	bookings, err := buc.BookingRepo.GetBookingsForTraveler(travelerID)
	if err != nil {
		statusCode, err := buc.ErrorService.TravelNotFound()
		return nil, statusCode, err
	}

	statusCode, err := buc.ErrorService.NoError()
	return bookings, statusCode, err
}

func (buc *BookingUseCase) GetTravelSeats(travelID string) (*[]bool, int, error) {
	travelSeats, err := buc.BookingRepo.GetTravelSeats(travelID)
	if err != nil {
		statusCode, err := buc.ErrorService.SeatsNotFound()
		return nil, statusCode, err
	}

	statusCode, err := buc.ErrorService.NoError()
	return travelSeats, statusCode, err
}

func (buc *BookingUseCase) UpdateBooking(bookingStatus *Domain.BookingStatus) (*Domain.Booking, int, error) {
	booking, err := buc.BookingRepo.GetBookingByBookingRef(bookingStatus.BookingRef)
	if err != nil {
		statusCode, err := buc.ErrorService.BookingNotFound()
		return nil, statusCode, err
	}

	if bookingStatus.Status == Domain.BookingStatusFailed {
		booking.PaymentRef.FailedPaymentRef = append(booking.PaymentRef.FailedPaymentRef, booking.PaymentRef.CurrentPaymentRef)
		booking.PaymentRef.PaymentSuccessful = false
		booking.Status = Domain.BookingStatusPending

		UUID := fmt.Sprintf("hw-booking-%s", uuid.New().String())
		booking.PaymentRef.CurrentPaymentRef = UUID
	} else if bookingStatus.Status == Domain.BookingStatusPaid {
		booking.Status = Domain.BookingStatusPaid
		booking.PaymentRef.PaymentSuccessful = true
		booking.PaymentType = "online"
		booking.PayTime = time.Now()
		booking.NotificationSent = false
	} else {
		statusCode, err := buc.ErrorService.UnableToSeekFile()
		return nil, statusCode, err
	}

	err = buc.BookingRepo.UpdateBooking(booking)
	if err != nil {
		////// Must CHANGE THE ERROR SERVICE TO BE MORE SPECIFIC like FailedToUpdateBooking(internal server error)
		statusCode, err := buc.ErrorService.BookingNotFound()
		return nil, statusCode, err
	}

	statusCode, err := buc.ErrorService.NoError()
	return booking, statusCode, err
}
