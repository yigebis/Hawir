package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Event struct {
	ID            primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title         string             `json:"title" bson:"title,omitempty" validate:"required"`
	Desc          string             `json:"desc" bson:"desc,omitempty" validate:"required,min=10"`
	DestinationID string             `json:"destination_id" bson:"destination_id,omitempty" validate:"required"`
	Date          time.Time          `json:"date" bson:"date" validate:"required"`
	MediaLink     string             `json:"media_link" bson:"media_link"`
}

type EventFilter struct {
	Title         string
	DestinationID string
	DateMin       time.Time
	DateMax       time.Time
}
