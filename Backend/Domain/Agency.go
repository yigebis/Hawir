package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Agency struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name             string             `json:"name" bson:"name,omitempty" validate:"required"`
	Password         string             `json:"password" bson:"password,omitempty" validate:"required"`
	RegistrationDate time.Time          `json:"registration_date,omitempty" bson:"registration_date"`
	Services         []string           `json:"services" bson:"services,omitempty"`
	LogoURL          string             `json:"logo_url" bson:"logo_url,omitempty"`
	Description      string             `json:"description" bson:"description,omitempty" validate:"required"`
	Contact          []string           `json:"contact" bson:"contact,omitempty" validate:"required"`
	Language         string             `json:"language" bson:"language,omitempty"`
	Calendar         string             `json:"calendar" bson:"calendar,omitempty"`
}
