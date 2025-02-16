package UseCase

import (
	"Hawir/Domain"
)

type BookingUseCase struct {
	BookingRepo IBookingRepository
	ErrorService IErrorService
}

func NewBookingUseCase(bookingRepo IBookingRepository, errorService IErrorService) IBookingUseCase {
	return &BookingUseCase{
		BookingRepo: bookingRepo,
		ErrorService: errorService,
	}
}

// Yigerem

// this will make the seat reserved for 5 minutes
func (buc *BookingUseCase) ChooseSeat(seatNo int, travelerID string, travelID string) (int, error) {
	panic("unimplemented")
}

// this will make the seat reserved for 30 minutes
func (buc *BookingUseCase) Book(booking *Domain.Booking) (int, error) {
	panic("unimplemented")
}

// this will free the chosen seat if not booked, and grants another seat
func (buc *BookingUseCase) ChangeSeat(seatNo int, travelerID string, travelID string) (int, error) {
	panic("unimplemented")
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
	panic("unimplemented")
}
func (buc *BookingUseCase) GetBooking(bookingID string) (*Domain.Booking, int, error) {
	panic("unimplemented")
}
func (buc *BookingUseCase) GetAllBookings(travelID string) (*[]Domain.Booking, int, error) {
	panic("unimplemented")
}
