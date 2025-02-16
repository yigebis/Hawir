package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BookingRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewBookingRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.IBookingRepository {
	return &BookingRepository{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}

// Book implements UseCase.IBookingRepository.
func (b *BookingRepository) Book(booking *Domain.Booking) error {
	panic("unimplemented")
}

// CancelBook implements UseCase.IBookingRepository.
func (b *BookingRepository) CancelBook(bookingID string) error {
	objId, err := primitive.ObjectIDFromHex(bookingID)
	if err != nil {
		return errors.New("invalid booking ID format")
	}

	filter := bson.M{"_id": objId}
	result, err := b.Collection.DeleteOne(b.DbCtx, filter)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("booking not found")
	}
	return nil
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
