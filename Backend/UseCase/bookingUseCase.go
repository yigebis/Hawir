package UseCase

import (
	"Hawir/Domain"
	"os"
	"strconv"
	"time"
)

type BookingUseCase struct {
	BookingRepo IBookingRepository
	// TravelRepo   ITravelRepository
	ErrorService IErrorService
}

func NewBookingUseCase(bookingRepo IBookingRepository, errorService IErrorService) IBookingUseCase {
	return &BookingUseCase{
		BookingRepo:  bookingRepo,
		ErrorService: errorService,
		// TravelRepo:   travelRepo,
	}
}

// Yigerem

// this will make the seat reserved for 5 minutes
func (buc *BookingUseCase) ChooseSeat(seat *Domain.Seat) (int, error) {
	// check whether the seat has been booked/chosen or not
	isReserved, err := buc.BookingRepo.CheckSeat(seat.TravelID, int(seat.SeatNo))

	if err != nil {
		return buc.ErrorService.InternalServer()
	}

	if isReserved {
		return buc.ErrorService.SeatReserved()
	}

	// check if the traveler has booked a seat before
	booking, _ := buc.BookingRepo.GetBookingByTravelerID(seat.TravelerID, seat.TravelID)
	if booking != nil {
		return buc.ErrorService.TravelerAlreadyBooked()
	}

	// check if the traveler has chosen a seat before
	seat, _ = buc.BookingRepo.GetSeatByTravelerID(seat.TravelerID, seat.TravelID)

	// if so, delete the seat and free up the seat
	if seat != nil {
		err = buc.BookingRepo.DeleteSeat(seat.SeatNo)
		if err != nil {
			return buc.ErrorService.InternalServer()
		}

		err = buc.BookingRepo.FreeSeat(seat.TravelID, seat.SeatNo)
		if err != nil {
			return buc.ErrorService.InternalServer()
		}
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

// this will make the seat reserved for 30 minutes
func (buc *BookingUseCase) Book(booking *Domain.Booking) (int, error) {
	// check whether the seat has been booked/chosen or not
	isReserved, err := buc.BookingRepo.CheckSeat(booking.TravelID, int(booking.SeatNo))
	if err != nil {
		return buc.ErrorService.InternalServer()
	}

	if isReserved {
		return buc.ErrorService.SeatReserved()
	}

	// check if the traveler has booked a seat before
	book, _ := buc.BookingRepo.GetBookingByTravelerID(booking.TravelerID, booking.TravelID)

	if book != nil {
		return buc.ErrorService.TravelerAlreadyBooked()
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

// Yohannes
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

func (buc *BookingUseCase) GetAllBookings(travelID string) (*[]Domain.Booking, int, error) {
	bookings, err := buc.BookingRepo.GetAllBookings(travelID)
	if err != nil {
		statusCode, err := buc.ErrorService.TravelNotFound()
		return nil, statusCode, err
	}

	statusCode, err := buc.ErrorService.NoError()
	return bookings, statusCode, err
}
