package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Booking struct {
	ID            primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	TravelID      string             `json:"travel_id" bson:"travel_id,omitempty"`
	TravelerID    string             `json:"traveler_id" bson:"traveler_id,omitempty"`
	SeatNo        int32              `json:"seat_no" bson:"seat_no,omitempty"`
	TripType      string             `json:"trip_type" bson:"trip_type,omitempty"`
	StartLocation string             `json:"start_location" bson:"start_location,omitempty"`
	PaymentType   float64            `json:"payment_type" bson:"payment_type,omitempty"`
	PaymentRef    string             `json:"payment_ref" bson:"payment_ref,omitempty"`
	BookTime      time.Time          `json:"book_time" bson:"book_time,omitempty"`
	PayTime       time.Time          `json:"pay_time" bson:"pay_time,omitempty"`
}
