package UseCase

import (
	"Hawir/Domain"
)

type IBookingUseCase interface {
	// Yigerem
	ChooseSeat(seatNo int, travelerID string, travelID string) (int, error) //this will make the seat reserved for 5 minutes
	Book(booking *Domain.Booking) (int, error)                              //this will make the seat reserved for 30 minutes
	ChangeSeat(seatNo int, travelerID string, travelID string) (int, error) //this will free the chosen seat if not booked, and grants another seat

	// Yohannes
	CancelBook(bookingID string) (int, error)
	EditBook(booking *Domain.Booking) (int, error)
	GetBooking(bookingID string) (*Domain.Booking, int, error)
	GetAllBookings(travelID string) (*[]Domain.Booking, int, error)
}
