package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BookingRepository struct {
	DbCtx                 context.Context
	BookingCollection     *mongo.Collection
	TravelStatsCollection *mongo.Collection
	SeatCollection        *mongo.Collection
	UserCollection        *mongo.Collection
}

func NewBookingRepository(dbCtx context.Context, bookingCollection, travelStatsCollection, SeatCollection, UserCollection *mongo.Collection) UseCase.IBookingRepository {
	return &BookingRepository{
		DbCtx:                 dbCtx,
		BookingCollection:     bookingCollection,
		TravelStatsCollection: travelStatsCollection,
		SeatCollection:        SeatCollection,
		UserCollection:        UserCollection,
	}
}

// ChooseSeat implements UseCase.IBookingRepository.
func (b *BookingRepository) ChooseSeat(seat *Domain.Seat) error {
	// create a seat data
	_, err := b.SeatCollection.InsertOne(b.DbCtx, seat)
	if err != nil {
		return err
	}

	// update the seat status of the travel
	filter := bson.M{"travel_id": seat.TravelID}
	update := bson.M{"$set": bson.M{fmt.Sprintf("seats.%d", seat.SeatNo): true}}

	_, err = b.TravelStatsCollection.UpdateOne(b.DbCtx, filter, update)

	return err
}

// Book implements UseCase.IBookingRepository.
func (b *BookingRepository) Book(booking *Domain.Booking) error {
	// create the booking data
	_, err := b.BookingCollection.InsertOne(b.DbCtx, booking)
	return err
}

func (b *BookingRepository) DeleteSeat(seatNo int) error {
	filter := bson.M{"seat_no": seatNo}
	_, err := b.SeatCollection.DeleteOne(b.DbCtx, filter)

	return err
}

func (b *BookingRepository) FreeSeat(travelID string, seatNo int) error {
	objID, err := primitive.ObjectIDFromHex(travelID)
	if err != nil {
		return err
	}

	filter := bson.M{"travel_id": objID}
	update := bson.M{"$set": bson.M{fmt.Sprintf("seats.%d", seatNo): false}}
	_, err = b.TravelStatsCollection.UpdateOne(b.DbCtx, filter, update)
	return err
}
func (b *BookingRepository) CheckSeat(travelID string, seatNo int) (bool, error) {
	// get the travel stat data
	filter := bson.M{"travel_id": travelID}
	var travelStat = Domain.TravelStats{}

	err := b.TravelStatsCollection.FindOne(b.DbCtx, filter).Decode(&travelStat)
	if err != nil {
		return false, err
	}

	// check if the seat is reserved
	return travelStat.Seats[seatNo], nil
}

func (b *BookingRepository) GetSeatByTravelerID(travelerID, travelID string) (*Domain.Seat, error) {
	filter := bson.M{"traveler_id": travelerID, "travel_id": travelID}

	var seat = Domain.Seat{}

	err := b.SeatCollection.FindOne(b.DbCtx, filter).Decode(&seat)
	if err != nil {
		return nil, err
	}

	return &seat, nil
}

// CancelBook implements UseCase.IBookingRepository.
func (b *BookingRepository) CancelBook(bookingID string) error {
	objId, err := primitive.ObjectIDFromHex(bookingID)
	if err != nil {
		return errors.New("invalid booking ID format")
	}

	filter := bson.M{"_id": objId}
	result, err := b.BookingCollection.DeleteOne(b.DbCtx, filter)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("booking not found")
	}
	return nil
}

// EditBook implements UseCase.IBookingRepository.
func (b *BookingRepository) EditBook(booking *Domain.Booking) error {
	objId, err := primitive.ObjectIDFromHex(booking.ID.Hex())
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objId}

	updateData := bson.M{
		"travel_id":      booking.TravelID,
		"traveler_id":    booking.TravelerID,
		"seat_no":        booking.SeatNo,
		"trip_Type":      booking.TripType,
		"start_location": booking.StartLocation,
		"payment_type":   booking.PaymentType,
		"payment_ref":    booking.PaymentRef,
		"book_time":      booking.BookTime,
		"pay_time":       booking.PayTime,
	}

	update := bson.M{"$set": updateData}

	result, err := b.BookingCollection.UpdateOne(b.DbCtx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("booking not found")
	}

	return nil
}

// GetBooking implements UseCase.IBookingRepository.
func (b *BookingRepository) GetBooking(bookingID string) (*Domain.Booking, error) {
	objId, err := primitive.ObjectIDFromHex(bookingID)
	if err != nil {
		return nil, errors.New("invalid booking ID format")
	}

	filter := bson.M{"_id": objId}

	var booking Domain.Booking
	err = b.BookingCollection.FindOne(b.DbCtx, filter).Decode(&booking)
	if err != nil {
		return nil, err
	}

	return &booking, nil
}

func (b *BookingRepository) GetBookingByTravelerID(travelerID, travelID string) (*Domain.Booking, error) {
	travelerObjID, err := primitive.ObjectIDFromHex(travelerID)
	if err != nil {
		return nil, err
	}
	travelObjID, err := primitive.ObjectIDFromHex(travelID)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"traveler_id": travelerObjID, "travel_id": travelObjID}

	var booking Domain.Booking
	err = b.BookingCollection.FindOne(b.DbCtx, filter).Decode(&booking)
	if err != nil {
		return nil, err
	}

	return &booking, nil
}

// GetAllBookings implements UseCase.IBookingRepository.
func (b *BookingRepository) GetAllBookings(travelID string) (*[]Domain.TravelBookings, error) {
	filter := bson.M{"travel_id": travelID}

	var bookings []Domain.Booking

	cursor, err := b.BookingCollection.Find(b.DbCtx, filter)
	if err != nil {
		return nil, err
	}

	defer cursor.Close(b.DbCtx)
	for cursor.Next(b.DbCtx) {
		var booking Domain.Booking
		err := cursor.Decode(&booking)
		if err != nil {
			return nil, err
		}

		bookings = append(bookings, booking)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	var travelBookings []Domain.TravelBookings
	for _, booking := range bookings {
		objId, err := primitive.ObjectIDFromHex(booking.TravelerID)
		if err != nil {
			return nil, errors.New("invalid traveller ID format")
		}

		filter = bson.M{"_id": primitive.ObjectID(objId)}
		var user Domain.User
		err = b.UserCollection.FindOne(b.DbCtx, filter).Decode(&user)
		if err != nil {
			return nil, err
		}

		travelBookings = append(travelBookings, Domain.TravelBookings{
			TravelerName:  user.FirstName + " " + user.LastName,
			SeatNo:        booking.SeatNo,
			Phone:         user.PhoneNumber,
			Email:         user.Email,
			BookTime:      booking.BookTime,
			BookTimeLimit: booking.BookTimeLimit,
			PayStatus:     booking.Status,
		})
	}

	return &travelBookings, nil
}

func (b *BookingRepository) GetBookingsForTraveler(travlerID string) (*[]Domain.Booking, error) {
	filter := bson.M{"traveler_id": travlerID}

	var bookings []Domain.Booking

	cursor, err := b.BookingCollection.Find(b.DbCtx, filter)
	if err != nil {
		return nil, err
	}

	defer cursor.Close(b.DbCtx)
	for cursor.Next(b.DbCtx) {
		var booking Domain.Booking
		err := cursor.Decode(&booking)
		if err != nil {
			return nil, err
		}

		bookings = append(bookings, booking)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return &bookings, nil
}

func (b *BookingRepository) GetTravellersIDForTrip(travelID string) (*[]string, error) {
	filter := bson.M{"travel_id": travelID}

	var travellers []string

	cursor, err := b.BookingCollection.Find(b.DbCtx, filter)
	if err != nil {
		return nil, err
	}

	defer cursor.Close(b.DbCtx)
	for cursor.Next(b.DbCtx) {
		var booking Domain.Booking
		err := cursor.Decode(&booking)
		if err != nil {
			return nil, err
		}
		print("traveller id: ", booking.TravelerID, "\n")
		travellers = append(travellers, booking.TravelerID)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return &travellers, nil
}
