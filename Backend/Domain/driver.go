package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Driver struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	FirstName        string             `json:"first_name" bson:"first_name" validate:"required,max=50"`
	LastName         string             `json:"last_name" bson:"last_name" validate:"required,max=50"`
	Sex              string             `json:"sex" bson:"sex" validate:"required,max=1"`
	DateOfBirth      time.Time          `json:"date_of_birth" bson:"date_of_birth" validate:"required"`
	Email            string             `json:"email" bson:"email" validate:"required,email"`
	Phone            string             `json:"phone" bson:"phone" validate:"required"`
	Photo            string             `json:"photo" bson:"photo"`
	Password         string             `json:"password" bson:"password" validate:"required"`
	AgencyID         string             `json:"agency_id" bson:"agency_id"`
	RegistrationDate time.Time          `json:"registration_date" bson:"registration_date"`
	CurrentTrips     []string           `json:"current_trips" bson:"current_trips"`
	Verified         bool               `json:"verified" bson:"verified"`
}

type DriverCredentials struct {
	Email    string `json:"email" bson:"email" validate:"required,email"`
	Password string `json:"password" bson:"password" validate:"required"`
}

type DriverChangeCredentials struct {
	OldPassword     string `json:"old_password" bson:"old_password" validate:"required"`
	NewPassword     string `json:"new_password" bson:"new_password" validate:"required"`
	ConfirmPassword string `json:"confirm_password" bson:"confirm_password" validate:"required"`
}
