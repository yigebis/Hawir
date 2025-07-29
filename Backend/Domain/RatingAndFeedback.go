package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RatingAndFeedback struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AgencyID   string             `json:"agency_id" bson:"agency_id" validate:"required"`
	Comment    string             `json:"comment" bson:"comment,omitempty"`
	Rating     int64              `json:"rating" bson:"rating, omitempty"`
	TravelID   string             `json:"travel_id" bson:"travel_id" validate:"required"`
	TravelerID string             `json:"traveler_id" bson:"traveler_id" validate:"required"`
	PostTime   time.Time          `json:"post_time" bson:"post_time,omitempty"`
}

type RatingAndFeedbackDisplay struct {
	Comment       string    `json:"comment"`
	Rating        int64     `json:"rating"`
	TravelID      string    `json:"travel_id"`
	TravelerName  string    `json:"traveler_name"`
	TravelerPhoto string    `json:"traveler_photo"`
	PostTime      time.Time `json:"post_time"`
}
