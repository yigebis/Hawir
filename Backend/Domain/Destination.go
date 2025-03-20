package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Destination struct {
	ID                 primitive.ObjectID    `json:"id" bson:"_id,omitempty"`
	Name               string                `json:"name" bson:"name,omitempty" validate:"required"`
	Latitude           string                `json:"latitude" bson:"latitude,omitempty" validate:"required"`
	Longitude          string                `json:"longitude" bson:"longitude,omitempty" validate:"required"`
	Description        string                `json:"description" bson:"description,omitempty" validate:"required"`
	Hotels             [][]Hotel             `json:"hotels" bson:"hotels,omitempty"`
	Culture            string                `json:"culture" bson:"culture,omitempty" validate:"required"`
	History            string                `json:"history" bson:"history,omitempty" validate:"required"`
	Population         string                `json:"population" bson:"population,omitempty" validate:"required"`
	TouristAttractions [][]TouristAttraction `json:"touristAttractions" bson:"touristAttractions,omitempty"`
	PostDate           time.Time             `json:"post_date" bson:"post_date,omitempty"`
}

type Hotel struct {
	Name     string `json:"name" bson:"name,omitempty" validate:"required"`
	ImageURL string `json:"imageUrl" bson:"imageUrl,omitempty" validate:"required"`
	MapLink  string `json:"mapLink" bson:"mapLink,omitempty" validate:"required"`
}

type TouristAttraction struct {
	Name     string `json:"name" bson:"name,omitempty" validate:"required"`
	Desc     string `json:"desc" bson:"desc,omitempty" validate:"required"`
	ImageURL string `json:"imageUrl" bson:"imageUrl,omitempty" validate:"required"`
}
