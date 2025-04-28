package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Travel struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AgencyId          string             `json:"agency_id" bson:"agency_id,omitempty"`
	StartLocation     string             `json:"start_location" bson:"start_location,omitempty" validate:"required"`
	PickupLocations   []string           `json:"pickup_locations" bson:"pickup_locations,omitempty" validate:"required"`
	Destination       string             `json:"destination" bson:"destination,omitempty" validate:"required"`
	PlannedStartTime  time.Time          `json:"planned_start_time" bson:"planned_start_time,omitempty" validate:"required"`
	ActualStartTime   time.Time          `json:"actual_start_time" bson:"actual_start_time,omitempty"`
	EstArrivalTime    time.Time          `json:"est_arrival_time" bson:"est_arrival_time,omitempty"`
	ActualArrivalTime time.Time          `json:"actual_arrival_time" bson:"actual_arrival_time,omitempty"`
	Price             float64            `json:"price" bson:"price,omitempty" validate:"required,min=0"`
	//Notice            string             `json:"notice" bson:"notice,omitempty" validate:"required"`
	TotalSeats int    `json:"total_seats" bson:"total_seats,omitempty" validate:"required,min=20"`
	BusRef     string `json:"bus_ref" bson:"bus_ref,omitempty"`
	// HasPayBack        bool               `json:"has_pay_back" bson:"has_pay_back,omitempty" validate:"required"`
	DriverID    string    `json:"driver_id" bson:"driver_id,omitempty"`
	PostTime    time.Time `json:"post_time" bson:"post_time,omitempty"`
	LastModTime time.Time `json:"last_mod_time" bson:"last_mod_time,omitempty"`
	Status      string    `json:"status" bson:"status,omitempty"`
}

type TravelStats struct {
	TravelID      string  `json:"travel_id" bson:"travel_id"` // Travel ID
	Seats         []bool  `json:"seats" bson:"seats"`
	ReservedCount int64   `json:"reserved_count" bson:"reserved_count"`
	AvgRating     float64 `json:"avg_rating" bson:"avg_rating"`
	RatedBy       int64   `json:"rated_by" bson:"rated_by"`
}
