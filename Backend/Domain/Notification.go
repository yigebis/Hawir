package Domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserNotification represents a collection of custom notifications for a specific traveller.
type UserNotification struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	TravellerID  string             `json:"traveller_id" bson:"traveller_id"` // Assuming travellerId links to a user/traveller
	Notifications []CustomNotification `json:"notifications" bson:"notifications"`
}

// CustomNotification represents a single notification with its details.
type CustomNotification struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"` // Add this line
	Title     string             `json:"title" bson:"title" validate:"required"`
	Message   string             `json:"message" bson:"message" validate:"required"`
	PostTime  time.Time          `json:"post_time" bson:"post_time"`
	Status    NotificationStatus `json:"status" bson:"status"`
}

// NotificationStatus defines the possible states of a notification.
type NotificationStatus string

const (
	NotificationStatusRead   NotificationStatus = "read"
	NotificationStatusUnread NotificationStatus = "unread"
)