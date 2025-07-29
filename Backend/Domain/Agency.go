package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Agency struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UniqueID         string             `json:"unique_id" bson:"unique_id,omitempty"`
	Name             string             `json:"name" bson:"name,omitempty" validate:"required"`
	RegistrationDate time.Time          `json:"registration_date,omitempty" bson:"registration_date"`
	Services         []string           `json:"services" bson:"services,omitempty"`
	LogoURL          string             `json:"logo_url" bson:"logo_url,omitempty"`
	Description      string             `json:"description" bson:"description,omitempty" validate:"required"`
	Contact          []string           `json:"contact" bson:"contact,omitempty" validate:"required"`
	Language         string             `json:"language" bson:"language,omitempty"`
	Calendar         string             `json:"calendar" bson:"calendar,omitempty"`
	SuperAdminEmail  string             `json:"super_admin_email" bson:"super_admin_email,omitempty" validate:"required,email"`
	Password         string             `json:"password" bson:"password,omitempty" validate:"required"`
}

type AgencyDisplay struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name,omitempty"`
	Services    []string           `json:"services" bson:"services,omitempty"`
	LogoURL     string             `json:"logo_url" bson:"logo_url,omitempty"`
	Description string             `json:"description" bson:"description,omitempty"`
	Contact     []string           `json:"contact" bson:"contact,omitempty"`
}

type AgencyAdmin struct {
	AgencyID string `json:"agency_id" bson:"agency_id,omitempty" validate:"required"`
	Role     string `json:"role" bson:"role,omitempty" validate:"required"`
	Email    string `json:"email" bson:"email,omitempty" validate:"required"`
	Password string `json:"password" bson:"password,omitempty" validate:"required"`
}

type AgencyAdminCredentials struct {
	AgencyID string `json:"agency_id"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type PasswordReset struct {
	UniqueID    string `json:"agency_id"`
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

type AgencyRating struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AgencyID         string             `json:"agency_id" bson:"agency_id" validate:"required"`
	Rating           float64            `json:"rating" bson:"rating" validate:"required"`
	TotalRatingSum   int64              `json:"total_rating_sum" bson:"total_rating_sum" validate:"required"`
	TotalRatingCount int64              `json:"total_rating_count" bson:"total_rating_count" validate:"required"`
}
