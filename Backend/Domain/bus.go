package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Bus struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	PlateNumber      string             `json:"plate_number" bson:"plate_number,omitempty" validate:"required"`
	AgencyID         string             `json:"agency_id" bson:"agency_id,omitempty"`
	Capacity         int                `json:"capacity" bson:"capacity,omitempty" validate:"required,min=10,max=100"`
	RegistrationDate time.Time          `json:"registration_date" bson:"registration_date,omitempty"`
	Description      string             `json:"description" bson:"description,omitempty"`
	IsReserved       bool               `json:"is_reserved" bson:"is_reserved,omitempty"`
	Status           string             `json:"status" bson:"status,omitempty"`
	CurrentTrips     []string           `json:"current_trip" bson:"current_trip,omitempty"`
}

type BusTracking struct {
	BusID     string    `json:"bus_id" bson:"bus_id,omitempty" validate:"required"`
	Latitude  float64   `json:"latitude" bson:"latitude,omitempty" validate:"required"`
	Longitude float64   `json:"longitude" bson:"longitude,omitempty" validate:"required"`
	Timestamp time.Time `json:"timestamp" bson:"timestamp,omitempty"`
}
