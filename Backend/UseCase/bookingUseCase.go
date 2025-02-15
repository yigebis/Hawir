package UseCase

import (
	"Hawir/Domain"
)

type BookingUseCase struct {
}

func NewBookingUseCase() IBookingUseCase {
	return &BookingUseCase{}
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
	panic("unimplemented")
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
