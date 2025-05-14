package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Booking represents a single booking transaction.
type Booking struct {
	ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	TravelID        string             `json:"travel_id" bson:"travel_id,omitempty"`
	TravelerID      string             `json:"traveler_id" bson:"traveler_id,omitempty"`
	SeatNo          int                `json:"seat_no" bson:"seat_no,omitempty"`
	TripType        string             `json:"trip_type" bson:"trip_type,omitempty"`
	StartLocation   string             `json:"start_location" bson:"start_location,omitempty"`
	Price           float64            `json:"price" bson:"price,omitempty"`
	PaymentType     string             `json:"payment_type" bson:"payment_type,omitempty"`
	PaymentRef      string             `json:"payment_ref" bson:"payment_ref,omitempty"`
	BookTime        time.Time          `json:"book_time" bson:"book_time,omitempty"`
	PayTime         time.Time          `json:"pay_time" bson:"pay_time,omitempty"` 
	BookTimeLimit   time.Time          `json:"book_time_limit" bson:"book_time_limit,omitempty"`
	Status          string             `json:"status" bson:"status,omitempty"` 
}

const (
	BookingStatusPending   = "pending"   // Booking made, payment pending
	BookingStatusPaid = "paid" // Payment received
	BookingStatusCancelled = "cancelled" // Booking cancelled (e.g., payment expired)
	BookingStatusCheckedIn = "checked_in" // User has checked in for the trip
)

type Seat struct {
	TravelID   string    `json:"travel_id" bson:"travel_id,omitempty" validate:"required"`
	TravelerID string    `json:"traveler_id" bson:"traveler_id,omitempty" validate:"required"`
	SeatNo     int       `json:"seat_no" bson:"seat_no,omitempty" validate:"required"`
	MaxTime    time.Time `json:"max_time" bson:"max_time,omitempty"`
}

type TravelBookings struct {
	TravelerName string `json:"traveler_name"`
	SeatNo int `json:"seat_no"`
	Phone string `json:"phone"`
	Email string `json:"email"`
	BookTime time.Time `json:"book_time"`
	BookTimeLimit time.Time `json:"book_time_limit"`
	PayStatus string `json:"pay_status"`
}