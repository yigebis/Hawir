package UseCase

import (
	"Hawir/Domain"
	"context"
)

type INotificationUseCase interface {
	NotifyCancelledBooking(userIDs *[]string, tripID string) error
	GetNotificationsForTraveller(travellerId string) ([]Domain.CustomNotification, int, error)
	SaveNotificationsForTraveller(customNotification *Domain.CustomNotification, travellerIDs []string) (string, error)
	MarkNotificationAsRead(travellerId string, notificationId string) (int, error)
	MarkNotificationAsUnread(travellerId string, notificationId string) (int, error)
	SendUpcomingTripNotifications(ctx context.Context)
}

type INotificationRepository interface {
	SaveNotification(customNotification *Domain.CustomNotification, travellerIDs []string) (string, error)
	GetNotifications(travellerId string) ([]Domain.CustomNotification, error)
	MarkNotificationAsRead(travellerId string, notificationId string) error
	MarkNotificationAsUnread(travellerId string, notificationId string) error
}