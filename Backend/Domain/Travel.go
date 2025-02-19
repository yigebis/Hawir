package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Travel struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AgencyId          string             `json:"agency_id" bson:"agency_id" validate:"required"`
	StartLocation     string             `json:"start_location" bson:"start_location" validate:"required"`
	PickupLocations   []string           `json:"pickup_locations" bson:"pickup_locations" validate:"required"`
	Destination       string             `json:"destination" bson:"destination" validate:"required"`
	PlannedStartTime  time.Time          `json:"planned_start_time" bson:"planned_start_time" validate:"required"`
	ActualStartTime   time.Time          `json:"actual_start_time" bson:"actual_start_time"`
	EstArrivalTime    time.Time          `json:"est_arrival_time" bson:"est_arrival_time"`
	ActualArrivalTime time.Time          `json:"actual_arrival_time" bson:"actual_arrival_time"`
	Price             float64            `json:"price" bson:"price" validate:"required"`
	Notice            string             `json:"notice" bson:"notice" validate:"required"`
	BusRef            string             `json:"bus_ref" bson:"bus_ref" validate:"required"`
	HasPayBack        bool               `json:"has_pay_back" bson:"has_pay_back"`
	DriverName        string             `json:"driver_name" bson:"driver_name" validate:"required"`
	PostTime          time.Time          `json:"post_time" bson:"post_time" validate:"required"`
	LastModTime       time.Time          `json:"last_mod_time" bson:"last_mod_time"`
	Status            string             `json:"status" bson:"status"`
}

type TravelStats struct {
	Seats         []bool  `json:"seats" bson:"seats"`
	ReservedCount int64   `json:"reserved_count" bson:"reserved_count"`
	AvgRating     float64 `json:"avg_rating" bson:"avg_rating"`
	RatedBy       int64   `json:"rated_by" bson:"rated_by"`
}
