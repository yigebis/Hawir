package Repository

import (
	"Hawir/Domain" // Import your Domain package containing Booking and Travel structs
	"Hawir/UseCase"
	"context" // Import for context
	"errors"
	"fmt"
	"time" // Import for time operations

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// BookingRepository is a concrete implementation of UseCase.IBookingRepository.
type BookingRepository struct {
	DbCtx                 context.Context
	BookingCollection     *mongo.Collection
	TravelStatsCollection *mongo.Collection
	SeatCollection        *mongo.Collection
	UserCollection        *mongo.Collection
	TravelCollection      *mongo.Collection 
}

// NewBookingRepository creates a new instance of BookingRepository.
func NewBookingRepository(
	dbCtx context.Context,
	bookingCollection *mongo.Collection,
	travelStatsCollection *mongo.Collection,
	SeatCollection *mongo.Collection,
	UserCollection *mongo.Collection,
	TravelCollection *mongo.Collection, 
) UseCase.IBookingRepository {
	return &BookingRepository{
		DbCtx:                 dbCtx,
		BookingCollection:     bookingCollection,
		TravelStatsCollection: travelStatsCollection,
		SeatCollection:        SeatCollection,
		UserCollection:        UserCollection,
		TravelCollection: TravelCollection,
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

func (b *BookingRepository) DeleteSeat(travelerID, travelID string) error {
	filter := bson.M{"traveler_id": travelerID, "travel_id": travelID}
	_, err := b.SeatCollection.DeleteOne(b.DbCtx, filter)

	return err
}

// FreeSeat implements UseCase.IBookingRepository.
func (b *BookingRepository) FreeSeat(travelID string, seatNo int) error {
	// Note: Assuming travelID is the ObjectID string for the TravelStats document
	filter := bson.M{"travel_id": travelID}
	update := bson.M{"$set": bson.M{fmt.Sprintf("seats.%d", seatNo): false}}
	_, err := b.TravelStatsCollection.UpdateOne(b.DbCtx, filter, update)
	return err
}

// CheckSeat implements UseCase.IBookingRepository.
func (b *BookingRepository) CheckSeat(travelID string, seatNo int) (bool, error) {
	// get the travel stat data
	filter := bson.M{"travel_id": travelID}
	var travelStat = Domain.TravelStats{}

	err := b.TravelStatsCollection.FindOne(b.DbCtx, filter).Decode(&travelStat)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, nil // No document, assume seat is not taken
		}
		return false, err
	}

	// check if the seat is reserved (assuming 0-based index in the array)
	if seatNo >= 0 && seatNo < len(travelStat.Seats) {
		return travelStat.Seats[seatNo], nil
	}

	return false, errors.New("invalid seat number for travel")
}

// GetSeatByTravelerID implements UseCase.IBookingRepository.
// Assumes this retrieves a temporary seat reservation by traveler and travel ID.
func (b *BookingRepository) GetSeatByTravelerID(travelerID, travelID string) (*Domain.Seat, error) {
	filter := bson.M{"traveler_id": travelerID, "travel_id": travelID}

	var seat = Domain.Seat{}

	err := b.SeatCollection.FindOne(b.DbCtx, filter).Decode(&seat)
	if err != nil {
		// If no document is found, return a specific error or nil
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("temporary seat reservation not found")
		}
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
// Note: This method seems to update the booking status to "confirmed" and payment details.
// It might be better named UpdateBookingStatus or similar.
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
		"price":          booking.Price,
		"payment_type":   booking.PaymentType,
		"payment_ref":    booking.PaymentRef,
		"book_time":      booking.BookTime,
		"pay_time":       booking.PayTime,
		"status":         Domain.BookingStatusPaid,
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
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("booking not found")
		}
		return nil, err
	}

	return &booking, nil
}

func (b *BookingRepository) GetBookingByBookingRef(booking_ref string) (*Domain.Booking, error) {
	filter := bson.M{"booking_ref": booking_ref}

	var booking Domain.Booking
	res := b.BookingCollection.FindOne(b.DbCtx, filter)

	if res == nil {
		return nil, errors.New("booking not found") // This check might be redundant if Decode handles ErrNoDocuments
	}

	err := res.Decode(&booking)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("booking not found")
		}
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
		// Assuming TravelerID is stored as a string ObjectID in Booking
		objId, err := primitive.ObjectIDFromHex(booking.TravelerID)
		if err != nil {
			// Log or handle this error appropriately - invalid TravelerID in a booking
			fmt.Printf("Invalid traveler ID format in booking %s: %v\n", booking.ID.Hex(), err)
			continue // Skip this booking if TravelerID is invalid
		}

		filter = bson.M{"_id": objId} // Filter by user's ObjectID
		var user Domain.User
		err = b.UserCollection.FindOne(b.DbCtx, filter).Decode(&user)
		if err != nil {
			// Log or handle this error - user not found for a booking
			fmt.Printf("User not found for traveler ID %s in booking %s: %v\n", booking.TravelerID, booking.ID.Hex(), err)
			continue // Skip this booking if user is not found
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
		travellers = append(travellers, booking.TravelerID)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return &travellers, nil
}

func (b *BookingRepository) GetTravelSeats(travelID string) (*[]bool, error) {
	// Note: Assuming travelID is the ObjectID string for the TravelStats document
	filter := bson.M{"travel_id": travelID}

	var travelStats Domain.TravelStats

	err := b.TravelStatsCollection.FindOne(b.DbCtx, filter).Decode(&travelStats)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// If TravelStats document doesn't exist, assume all seats are free.
			// You might need to know the total number of seats from the Travel document.
			// For now, returning an empty slice.
			fmt.Printf("TravelStats not found for travel ID %s. Assuming no seats taken.\n", travelID)
			return &[]bool{}, nil // Return empty slice if no stats found
		}
		return nil, err
	}

	return &travelStats.Seats, nil
}

func (b *BookingRepository) UpdateBooking(booking *Domain.Booking) (error) {
	objId, err := primitive.ObjectIDFromHex(booking.ID.Hex())
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objId}

	// Only include fields that are intended to be updated by this method
	updateData := bson.M{
		"payment_ref":    booking.PaymentRef,
		"pay_time":       booking.PayTime,
		"status":         booking.Status,
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

func (b *BookingRepository) FindConfirmedBookingsForUpcomingTravel(ctx context.Context, startTime, endTime time.Time) ([]Domain.Booking, error) {
	// Define the aggregation pipeline
	pipeline := []bson.M{
		{
			// Match confirmed bookings that haven't had a notification sent
			"$match": bson.M{
				"status":            Domain.BookingStatusPaid, // Match confirmed bookings
				"notification_sent": false, // Match bookings where notification hasn't been sent
			},
		},
		{
			// Perform a lookup (join) with the 'travels' collection
			"$lookup": bson.M{
				"from":         "travels", // The collection to join with (replace "travels" with your actual travel collection name)
				"localField":   "travel_id", // Field from the bookings collection
				"foreignField": "_id", // Field from the travels collection (assuming TravelID in booking is the ObjectID string of the travel)
				"as":           "travel_info", // Output array field name
			},
		},
		{
			// Deconstruct the travel_info array
			"$unwind": "$travel_info",
		},
		{
			// Match based on the PlannedStartTime of the joined travel document
			"$match": bson.M{
				"travel_info.planned_start_time": bson.M{
					"$gte": startTime, // Planned start time is greater than or equal to startTime
					"$lt":  endTime,   // Planned start time is less than endTime
				},
			},
		},
		{
			// Project the fields from the original booking document
			// This reshapes the output to match the Domain.Booking struct
			"$project": bson.M{
				"_id": 1,
				"booking_ref": 1,
				"travel_id": 1,
				"traveler_id": 1,
				"seat_no": 1,
				"trip_type": 1,
				"start_location": 1,
				"price": 1,
				"payment_type": 1,
				"payment_ref": 1, // Assuming PaymentRef is a struct or needs specific projection
				"book_time": 1,
				"pay_time": 1,
				"book_time_limit": 1,
				"status": 1,
				"notification_sent": 1,
				// Add other fields from the Booking struct as needed
				// Exclude the joined travel_info field
			},
		},
	}

	var bookings []Domain.Booking
	cursor, err := b.BookingCollection.Aggregate(ctx, pipeline)
	if err != nil {
		fmt.Printf("Error executing aggregation pipeline: %v\n", err) // Log error
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &bookings); err != nil {
		fmt.Printf("Error decoding aggregation results: %v\n", err) // Log error
		return nil, err
	}

	fmt.Printf("Found %d bookings matching criteria.\n", len(bookings)) // Log count

	return bookings, nil
}

// MarkNotificationSent updates a booking document to set the NotificationSent field to true.
func (b *BookingRepository) MarkNotificationSent(ctx context.Context, bookingID string) error {
	// Convert the booking ID string to a MongoDB ObjectID
	objID, err := primitive.ObjectIDFromHex(bookingID)
	if err != nil {
		fmt.Printf("Invalid booking ID format for marking notification sent: %v\n", err) // Log error
		return fmt.Errorf("invalid booking ID format: %w", err) // Return a wrapped error
	}

	// Define the filter to find the booking document by its ObjectID
	filter := bson.M{"_id": objID}

	// Define the update operation to set notification_sent to true
	update := bson.M{"$set": bson.M{"notification_sent": true}}

	// Perform the update operation
	result, err := b.BookingCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		fmt.Printf("Error updating booking %s to mark notification sent: %v\n", bookingID, err) // Log error
		return fmt.Errorf("failed to update booking notification status: %w", err) // Return a wrapped error
	}

	// Check if a document was matched and modified
	if result.MatchedCount == 0 {
		fmt.Printf("Booking %s not found for marking notification sent.\n", bookingID) // Log
		return errors.New("booking not found") // Return a "booking not found" error
	}
	if result.ModifiedCount == 0 {
		fmt.Printf("Booking %s already had notification_sent set to true.\n", bookingID) // Log
		// It's not strictly an error if it was already true, but worth logging.
		// You can choose to return nil or a specific info error here. Returning nil for now.
	}

	fmt.Printf("Successfully marked notification sent for booking %s.\n", bookingID) // Log success

	return nil // Return nil on successful update
}
