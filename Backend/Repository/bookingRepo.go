package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/mongo"
)

type BookingRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

// Book implements UseCase.IBookingRepository.
func (b *BookingRepository) Book(booking *Domain.Booking) error {
	panic("unimplemented")
}

// CancelBook implements UseCase.IBookingRepository.
func (b *BookingRepository) CancelBook(bookingID string) error {
	panic("unimplemented")
}

// ChangeSeat implements UseCase.IBookingRepository.
func (b *BookingRepository) ChangeSeat(seatNo int, travelerID string, travelID string) error {
	panic("unimplemented")
}

// ChooseSeat implements UseCase.IBookingRepository.
func (b *BookingRepository) ChooseSeat(seatNo int, travelerID string, travelID string) error {
	panic("unimplemented")
}

// EditBook implements UseCase.IBookingRepository.
func (b *BookingRepository) EditBook(booking *Domain.Booking) error {
	panic("unimplemented")
}

// GetAllBookings implements UseCase.IBookingRepository.
func (b *BookingRepository) GetAllBookings(travelID string) (*[]Domain.Booking, error) {
	panic("unimplemented")
}

// GetBooking implements UseCase.IBookingRepository.
func (b *BookingRepository) GetBooking(bookingID string) (*Domain.Booking, error) {
	panic("unimplemented")
}

func NewBookingRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.IBookingRepository {
	return &BookingRepository{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}
