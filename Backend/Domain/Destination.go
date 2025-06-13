package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Destination struct {
	ID       primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name     string             `json:"name" bson:"name,omitempty" validate:"required"`
	Stations []string           `json:"stations" bson:"stations,omitempty"`
	Image    string             `json:"image" bson:"image,omitempty"`
}

// separated detail collections for the sake of efficiency
type DestinationDetails struct {
	DestinationID string  `json:"destination_id" bson:"destination_id,omitempty" validate:"required"`
	Latitude      string  `json:"latitude" bson:"latitude,omitempty"`
	Longitude     string  `json:"longitude" bson:"longitude,omitempty"`
	Description   string  `json:"description" bson:"description,omitempty"`
	Hotels        []Hotel `json:"hotels" bson:"hotels,omitempty" validate:"dive"`
	Culture       string  `json:"culture" bson:"culture,omitempty"`
	History       string  `json:"history" bson:"history,omitempty"`
	// Population         string              `json:"population" bson:"population,omitempty"`
	TouristAttractions []TouristAttraction `json:"tourist_attractions" bson:"tourist_attractions,omitempty" validate:"dive"`
	// Weather            string              `json:"weather" bson:"weather,omitempty"`
	PostDate time.Time `json:"post_date" bson:"post_date,omitempty"`
}

type Hotel struct {
	Name     string `json:"name" bson:"name,omitempty" validate:"required"`
	ImageURL string `json:"image_url" bson:"image_url,omitempty"`
	MapLink  string `json:"map_link" bson:"map_link,omitempty"`
}

type TouristAttraction struct {
	Name     string `json:"name" bson:"name,omitempty" validate:"required"`
	Desc     string `json:"desc" bson:"desc,omitempty" validate:"required"`
	ImageURL string `json:"image_url" bson:"image_url,omitempty"`
	MapLink  string `json:"map_link" bson:"map_link,omitempty"`
}

type AddStationsRequest struct {
	Stations []string `json:"stations" bson:"stations,omitempty"`
}

type TopDestinationReportItem struct {
    DestinationName string `bson:"_id" json:"destination"` // The destination name from the _id of the group
    TotalTravelers  int64  `bson:"totalTravelers" json:"totalTravelers"` // The sum of travelers
}
