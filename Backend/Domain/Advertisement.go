package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Advertisement struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title" validate:"required,min=3,max=50"`
	Description string             `bson:"description" json:"description" validate:"required,min=10,max=700"`
	MediaURL    string             `bson:"media_url" json:"media_url" validate:"required"`
	AgencyID    string             `bson:"agency_id" json:"agency_id"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}
