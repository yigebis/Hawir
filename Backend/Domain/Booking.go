package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Booking represents a single booking transaction.
type Booking struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	BookingRef       string             `json:"booking_ref" bson:"booking_ref,omitempty"`
	TravelID         string             `json:"travel_id" bson:"travel_id,omitempty"`
	TravelerID       string             `json:"traveler_id" bson:"traveler_id,omitempty"`
	FirstName        string             `json:"first_name" bson:"first_name"`
	LastName         string             `json:"last_name" bson:"last_name"`
	Email            string             `json:"email" bson:"email"`
	PhoneNumber      string             `json:"phone_number" bson:"phone_number"`
	SeatNo           int                `json:"seat_no" bson:"seat_no,omitempty"`
	TripType         string             `json:"trip_type" bson:"trip_type,omitempty"`
	StartLocation    string             `json:"start_location" bson:"start_location,omitempty"`
	Destination      string             `json:"destination" bson:"destination,omitempty"`
	Price            float64            `json:"price" bson:"price,omitempty"`
	PaymentType      string             `json:"payment_type" bson:"payment_type,omitempty"`
	PaymentRef       Payment            `json:"payment_ref" bson:"payment_ref"`
	BookTime         time.Time          `json:"book_time" bson:"book_time,omitempty"`
	PayTime          time.Time          `json:"pay_time" bson:"pay_time,omitempty"`
	BookTimeLimit    time.Time          `json:"book_time_limit" bson:"book_time_limit,omitempty"`
	Status           string             `json:"status" bson:"status,omitempty"`
	NotificationSent bool               `json:"notification_sent" bson:"notification_sent"`
}

type Payment struct {
	CurrentPaymentRef string   `json:"current_payment_ref" bson:"current_payment_ref"`
	PaymentSuccessful bool     `json:"payment_successful" bson:"payment_successful"`
	FailedPaymentRef  []string `json:"failed_payment_ref" bson:"failed_payment_ref"`
}

type BookingStatus struct {
	BookingRef string `json:"booking_ref" validate:"required"`
	Status     string `json:"status" validate:"required"`
}

const (
	BookingStatusPending   = "pending"   // Booking made, payment pending
	BookingStatusPaid      = "confirmed" // Payment received
	BookingStatusFailed    = "failed"
	BookingStatusCancelled = "cancelled"  // Booking cancelled (e.g., payment expired)
	BookingStatusCheckedIn = "checked_in" // User has checked in for the trip
)

type Seat struct {
	TravelID   string    `json:"travel_id" bson:"travel_id,omitempty" validate:"required"`
	TravelerID string    `json:"traveler_id" bson:"traveler_id,omitempty"`
	SeatNo     int       `json:"seat_no" bson:"seat_no" validate:"required"`
	MaxTime    time.Time `json:"max_time" bson:"max_time,omitempty"`
}

type TravelBookings struct {
	TravelerName  string    `json:"traveler_name"`
	SeatNo        int       `json:"seat_no"`
	Phone         string    `json:"phone"`
	Email         string    `json:"email"`
	BookTime      time.Time `json:"book_time"`
	BookTimeLimit time.Time `json:"book_time_limit"`
	PayStatus     string    `json:"pay_status"`
}
