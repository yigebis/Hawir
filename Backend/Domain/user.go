package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	FirstName         string             `json:"first_name" bson:"first_name" validate:"required,min=1,max=50"`
	LastName          string             `json:"last_name" bson:"last_name" validate:"required,min=1,max=50"`
	LoginPreference   string             `json:"login_preference" bson:"login_preference" validate:"required"`
	Email             string             `json:"email" bson:"email" validate:"email"`
	PhoneNumber       string             `json:"phone_number" bson:"phone_number"`
	Password          string             `json:"password" bson:"password" validate:"required,min=8"`
	ProfilePhoto      string             `json:"profile_photo" bson:"profile_photo"`
	RegistrationDate  time.Time          `json:"registration_date" bson:"registration_date"`
	Verified          bool               `json:"verified" bson:"verified"`
	FavouriteAgencies []string           `json:"favourite_agencies" bson:"favourite_agencies"`
}

type EmailCredential struct {
	Email    string `json:"email" bson:"email"`
	Password string `json:"password" bson:"password"`
}

type PhoneCredential struct {
	PhoneNumber string `json:"phone_number" bson:"phone_number"`
	Password    string `json:"password" bson:"password"`
}

type ChangeCredential struct {
	Email       string `json:"email" bson:"email"`
	OldPassword string `json:"old_password" bson:"old_password"`
	NewPassword string `json:"new_password" bson:"new_password"`
}
