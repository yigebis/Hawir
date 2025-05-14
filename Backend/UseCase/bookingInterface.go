package UseCase

import (
	"Hawir/Domain"
)

type IBookingUseCase interface {
	// Yigerem
	ChooseSeat(seat *Domain.Seat) (int, error) //this will make the seat reserved for 5 minutes
	Book(booking *Domain.Booking) (*Domain.Booking, int, error) //this will make the seat reserved for 30 minutes

	// Yohannes
	CancelBook(bookingID string) (int, error)
	EditBook(booking *Domain.Booking) (int, error)
	GetBooking(bookingID string) (*Domain.Booking, int, error)
	GetAllBookings(travelID string) (*[]Domain.TravelBookings, int, error)
	GetBookingsForTraveler(travelerID string) (*[]Domain.Booking, int, error)
	GetTravelSeats(travelID string) (*[]bool, int, error)
}

type IBookingRepository interface {
	ChooseSeat(seat *Domain.Seat) error
	Book(booking *Domain.Booking) error
	DeleteSeat(travelerID, travelID string) error
	CheckSeat(travelID string, seatNo int) (bool, error)
	FreeSeat(travelID string, seatNo int) error
	GetSeatByTravelerID(travelerID, travelID string) (*Domain.Seat, error)

	CancelBook(bookingID string) error
	EditBook(booking *Domain.Booking) error
	GetBooking(bookingID string) (*Domain.Booking, error)
	GetBookingByTravelerID(travelerID string, travelID string) (*Domain.Booking, error)
	GetAllBookings(travelID string) (*[]Domain.TravelBookings, error)
	GetBookingsForTraveler(travelerID string) (*[]Domain.Booking, error)
	GetTravellersIDForTrip(travelID string) (*[]string, error)
	GetTravelSeats(travelID string) (*[]bool, error)
}
