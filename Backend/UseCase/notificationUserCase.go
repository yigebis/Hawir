package UseCase

import (
	"Hawir/Domain"
	"context"
	"fmt"
	"log"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
)

type NotificationUseCase struct {
	UserRepo    IUserRepository
	NotificationRepository INotificationRepository
	FirebaseApp *firebase.App
}

func NewNotificationUseCase(ur IUserRepository, nr INotificationRepository, fbApp *firebase.App) INotificationUseCase {
	return &NotificationUseCase{
		UserRepo:    ur,
		NotificationRepository: nr,
		FirebaseApp: fbApp,
	}
}

func (nuc *NotificationUseCase) NotifyCancelledBooking(userIDs *[]string, tripID string) error {
	ctx := context.Background()
	client, err := nuc.FirebaseApp.Messaging(ctx)
	if err != nil {
		return fmt.Errorf("error getting Firebase Messaging client: %w", err)
	}

	for _, userID := range *userIDs {
		user, err := nuc.UserRepo.GetUserById(userID)
		if err != nil {
			log.Printf("error getting user %s: %v", userID, err)
			continue
		}

		if len(user.FcmTokens) > 0 {
			// messages := make([]*messaging.Message, 0, len(user.FcmTokens))
			// for _, token := range user.FcmTokens {
			// 	msg := &messaging.Message{
			// 		Token: token,
			// 		Notification: &messaging.Notification{
			// 			Title: "Trip Cancelled",
			// 			Body:  fmt.Sprintf("The trip with ID %s has been cancelled.", tripID),
			// 		},
			// 		Data: map[string]string{
			// 			"trip_id":         tripID,
			// 			"notification_type": "trip_cancelled",
			// 		},
			// 	}
			// 	messages = append(messages, msg)
			// }

			response, err := client.SendEachForMulticast(ctx, &messaging.MulticastMessage{
				Tokens: user.FcmTokens,
				Notification: &messaging.Notification{
					Title: "Trip Cancelled",
					Body:  fmt.Sprintf("The trip with ID %s has been cancelled.", tripID),
				},
				Data: map[string]string{
					"trip_id":         tripID,
					"notification_type": "trip_cancelled",
				},
			})
			log.Printf("Full response: %s", response)
			log.Printf("Response: %s",response.FailureCount)
			log.Printf("REsponse: %s", response.SuccessCount)
			if err != nil {
				log.Printf("error sending messages to user %s for trip %s: %v", userID, tripID, err)
			} else {
				log.Printf("successfully sent %d messages to user %s for trip %s, failed %d: %+v", response.SuccessCount, userID, tripID, response.FailureCount, response.Responses)
				for _, resp := range response.Responses {
					if resp.Error != nil {
						log.Printf("failed sending to token: %s, error: %v", resp.MessageID, resp.Error)
						// Consider removing invalid tokens from the user's document
					}
				}
			}
		} else {
			log.Printf("no FCM tokens found for user %s", userID)
		}
	}

	return nil
}

func (nuc *NotificationUseCase) GetNotificationsForTraveller(travellerId string) ([]Domain.CustomNotification, int, error) {
	notifications, err := nuc.NotificationRepository.GetNotifications(travellerId)
	if err != nil {
		return nil, 0, err
	}

	return notifications, 200, nil
}

func (nuc *NotificationUseCase) SaveNotificationsForTraveller(customNotification *Domain.CustomNotification, travellerIDs []string) (string, error) {
	str, err := nuc.NotificationRepository.SaveNotification(customNotification, travellerIDs)
	if err != nil {
		return "", err 
	}

	return str, nil
}

// MarkNotificationAsRead marks a specific notification as read for a traveller.
func (nuc *NotificationUseCase) MarkNotificationAsRead(travellerId string, notificationId string) (int, error) {
	err := nuc.NotificationRepository.MarkNotificationAsRead(travellerId, notificationId)
	if err != nil {
		log.Printf("Error marking notification %s as read for traveller %s: %v", notificationId, travellerId, err)
		return 400, fmt.Errorf("failed to mark notification as read")
	}

	// If the repository operation was successful, return 200 OK and nil error.
	return 200, nil
}

// MarkNotificationAsUnread marks a specific notification as unread for a traveller.
func (nuc *NotificationUseCase) MarkNotificationAsUnread(travellerId string, notificationId string) (int, error) {
	err := nuc.NotificationRepository.MarkNotificationAsUnread(travellerId, notificationId)
	if err != nil {
		log.Printf("Error marking notification %s as unread for traveller %s: %v", notificationId, travellerId, err)
		return 400, fmt.Errorf("failed to mark notification as unread")
	}

	// If the repository operation was successful, return 200 OK and nil error.
	return 200, nil
}
