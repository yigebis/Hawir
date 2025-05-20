package UseCase

import (
	"Hawir/Domain"
	"context"
	"fmt"
	"log"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
)

type NotificationUseCase struct {
	UserRepo    IUserRepository
	BookingRepository IBookingRepository
	NotificationRepository INotificationRepository
	FirebaseApp *firebase.App
}

func NewNotificationUseCase(ur IUserRepository, br IBookingRepository, nr INotificationRepository, fbApp *firebase.App) INotificationUseCase {
	return &NotificationUseCase{
		UserRepo:    ur,
		BookingRepository: br,
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
			log.Printf("Full response: %+v", response)
			log.Printf("Response: %+v",response.FailureCount)
			log.Printf("REsponse: %+v", response.SuccessCount)
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

func (nuc *NotificationUseCase) SendUpcomingTripNotifications(ctx context.Context) {
	fmt.Println("Running scheduled task: SendUpcomingTripNotifications") // Log task start

	// Define the time window for upcoming trips (e.g., between 23 and 25 hours from now)
	// This window helps capture trips that are exactly one day away,
	// accounting for potential minor scheduling delays.
	now := time.Now()
	startTime := now.Add(23 * time.Hour) // Start checking from 23 hours from now
	endTime := now.Add(25 * time.Hour)   // End checking at 25 hours from now

	// --- START: Query for relevant bookings ---
	// Query the database for confirmed bookings within the time window
	// that have NotificationSent set to false.
	// This calls the method you need to implement in your Booking Repository.
	bookings, err := nuc.BookingRepository.FindConfirmedBookingsForUpcomingTravel(ctx, startTime, endTime)
	if err != nil {
		fmt.Printf("Error querying for upcoming bookings: %v\n", err) // Log error
		// Decide how to handle this error - maybe log to a more persistent system
		return // Stop task execution on query error
	}
	// --- END: Query for relevant bookings ---

	fmt.Printf("Found %d upcoming bookings to process.\n", len(bookings)) // Log count

	// Get Firebase Messaging client
	client, err := nuc.FirebaseApp.Messaging(ctx)
	if err != nil {
		fmt.Printf("Error getting Firebase Messaging client: %v. Cannot send notifications.\n", err) // Log error
		return // Stop task if FCM client cannot be obtained
	}


	// Iterate through the found bookings
	for _, booking := range bookings {
		// --- START: Fetch Traveler FCM Token ---
		// Fetch the user details to get the FCM token(s).
		// Assuming UserRepo.GetUserById returns a Domain.User struct with FcmTokens field.
		user, err := nuc.UserRepo.GetUserById(booking.TravelerID)
		if err != nil {
			fmt.Printf("Error fetching user %s for booking %s: %v. Skipping notification.\n", booking.TravelerID, booking.ID.Hex(), err) // Log error
			continue // Skip to the next booking if user fetching fails
		}
		if user == nil || len(user.FcmTokens) == 0 {
			fmt.Printf("No user found or no FCM tokens for traveler %s for booking %s. Skipping notification.\n", booking.TravelerID, booking.ID.Hex()) // Log
			continue // Skip if no user or no tokens are found
		}
		// --- END: Fetch Traveler FCM Token ---

		// --- START: Send FCM Notification ---
		// Prepare and send the FCM notification using MulticastMessage for potentially multiple tokens.
		notificationTitle := "Upcoming Trip Reminder" // Localize this if needed
		// You might need to fetch Travel details here to get the actual trip destination/details
		// For now, using StartLocation from the booking, assuming it's available and sufficient.
		notificationBody := fmt.Sprintf("Your trip from %s is scheduled for tomorrow.", booking.StartLocation) // Customize and localize this message

		// Optional: Add data payload for handling in the mobile app (e.g., navigate to booking details)
		notificationData := map[string]string{
			"booking_id": booking.ID.Hex(),
			"travel_id":  booking.TravelID,
			"notification_type": "upcoming_trip_reminder", // Define a type for the app to handle
			// Add other relevant data
		}

		// Send the multicast message
		response, err := client.SendEachForMulticast(ctx, &messaging.MulticastMessage{
			Tokens: user.FcmTokens, // Send to all tokens for the user
			Notification: &messaging.Notification{
				Title: notificationTitle,
				Body:  notificationBody,
			},
			Data: notificationData,
		})

		if err != nil {
			fmt.Printf("Error sending FCM notification to traveler %s for booking %s: %v\n", booking.TravelerID, booking.ID.Hex(), err) // Log error
			// Decide how to handle send errors: retry later, log and ignore, etc.
			// For this example, we'll just log and continue.
			continue
		}

		// Log the results of the multicast send
		fmt.Printf("Successfully sent %d messages for booking %s to traveler %s, failed %d.\n", response.SuccessCount, booking.ID.Hex(), booking.TravelerID, response.FailureCount)
		if response.FailureCount > 0 {
			for _, resp := range response.Responses {
				if resp.Error != nil {
					// Log specific token failures
					// resp.MessageID is the token that failed if available, otherwise resp.Error contains details
					log.Printf("  Failed sending to a token for booking %s: %v", booking.ID.Hex(), resp.Error)
					// Consider adding logic here to identify and remove invalid tokens from the user's document
				}
			}
		}
		// --- END: Send FCM Notification ---


		// --- START: Mark Notification as Sent ---
		// Mark the booking as having the notification sent to prevent duplicates.
		// This calls the method you need to implement in your Booking Repository.
		err = nuc.BookingRepository.MarkNotificationSent(ctx, booking.ID.Hex())
		if err != nil {
			fmt.Printf("Error marking notification as sent for booking %s: %v\n", booking.ID.Hex(), err) // Log error
			// This is a critical error; the notification might be sent again if this fails.
			// You might need a more robust error handling/retry mechanism here.
		}
		// --- END: Mark Notification as Sent ---
	}

	fmt.Println("Finished scheduled task: SendUpcomingTripNotifications") // Log task end
}
