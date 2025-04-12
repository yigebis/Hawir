package UseCase

import (
	"Hawir/Domain"
	"os"
	"strconv"
	"time"
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

// this will make the seat reserved for 30 minutes
func (buc *BookingUseCase) Book(booking *Domain.Booking) (int, error) {
	// check whether the seat has been choosen by the traveler or not
	_, err := buc.BookingRepo.GetSeatByTravelerID(booking.TravelerID, booking.TravelID)
	if err != nil {
		return buc.ErrorService.SeatNotChosen()
	}

	// delete the seat
	err = buc.BookingRepo.DeleteSeat(booking.SeatNo)
	if err != nil {
		return buc.ErrorService.InternalServer()
	}

	// reserve it for some minutes
	bookReservationSpan, err := strconv.Atoi(os.Getenv("BOOK_RESERVATION_SPAN"))

	if err != nil {
		return buc.ErrorService.InternalServer()
	}

	maxTime := time.Now().Add(time.Duration(bookReservationSpan))
	booking.BookTimeLimit = maxTime

	err = buc.BookingRepo.Book(booking)
	if err != nil {
		return buc.ErrorService.InternalServer()
	}

	return buc.ErrorService.NoError()
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