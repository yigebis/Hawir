package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"fmt"
	"time" // Import the time package

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options" // Import the options package
)

type NotificationRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewNotificationRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.INotificationRepository {
	return &NotificationRepository{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}

func (nr *NotificationRepository) SaveNotification(customNotification *Domain.CustomNotification, travellerIDs []string) (string, error) {
	// Ensure the PostTime is set if it's zero
	if customNotification.PostTime.IsZero() {
		customNotification.PostTime = time.Now()
	}

	// Ensure the Status is set if it's an empty string
	if customNotification.Status == "" {
		customNotification.Status = Domain.NotificationStatusUnread
	}

	if customNotification.ID.IsZero() {
		customNotification.ID = primitive.NewObjectID()
	}

	// Prepare the update operation - push the custom notification to the notifications array
	update := bson.M{
		"$push": bson.M{
			"notifications": customNotification,
		},
	}

	// Set options for the update operation.
	// Upsert: true means if no document matches the filter, a new one will be created.
	opts := options.Update().SetUpsert(true)

	var lastResult *mongo.UpdateResult
	var lastErr error

	// Iterate through the list of traveller IDs
	for _, travellerId := range travellerIDs {
		// Filter to find the UserNotification document for the current travellerId
		filter := bson.M{"traveller_id": travellerId}

		// Perform the update operation for the current traveller
		result, err := nr.Collection.UpdateOne(nr.DbCtx, filter, update, opts)

		// Store the result and error of the current operation
		lastResult = result
		lastErr = err

		if err != nil {
			fmt.Printf("Error saving notification for traveller %s: %v\n", travellerId, err)
		}
	}

	if lastErr != nil {
		return "", fmt.Errorf("failed to save notification for one or more travellers (last error): %w", lastErr)
	}

	// If the last operation was an upsert, return the new document's ID
	if lastResult != nil && lastResult.UpsertedID != nil {
		objectID, ok := lastResult.UpsertedID.(primitive.ObjectID)
		if ok {
			// Note: This is the ID of the UserNotification document, not the CustomNotification.
			return objectID.Hex(), nil
		}
	}

	// If the last operation modified an existing document
	if lastResult != nil && lastResult.ModifiedCount > 0 {
		// We can return the ID of the custom notification that was added.
		return customNotification.ID.Hex(), nil
	}

	// If the list of travellerIDs was empty or something unexpected happened in the last iteration
	if len(travellerIDs) == 0 {
		return "", fmt.Errorf("no traveller IDs provided to save notification")
	}

	// Fallback for unexpected scenario in the last iteration
	return "", fmt.Errorf("failed to determine outcome of saving notification for the last traveller processed")
}

func (nr *NotificationRepository) GetNotifications(travellerId string) ([]Domain.CustomNotification, error) {
	// Filter to find the UserNotification document for the given travellerId
	filter := bson.M{"traveller_id": travellerId}

	// Projection to include only the notifications field
	projection := bson.M{"notifications": 1}

	// Find the document
	var userNotification Domain.UserNotification
	err := nr.Collection.FindOne(nr.DbCtx, filter, options.FindOne().SetProjection(projection)).Decode(&userNotification)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // No notifications found for this travellerId
		}
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}

	return userNotification.Notifications, nil
}

// MarkNotificationAsRead finds a specific notification for a traveller and updates its status to "read".
func (nr *NotificationRepository) MarkNotificationAsRead(travellerId string, notificationId string) error {
	// Convert the notificationId string to a primitive.ObjectID
	objID, err := primitive.ObjectIDFromHex(notificationId)
	if err != nil {
		return fmt.Errorf("invalid notification ID format: %w", err)
	}

	filter := bson.M{
		"traveller_id": travellerId,
		"notifications._id": objID, // Match the notification within the array by its _id
	}

	update := bson.M{
		"$set": bson.M{
			"notifications.$.status": Domain.NotificationStatusRead, // Use the positional operator
		},
	}

	// Perform the update operation
	result, err := nr.Collection.UpdateOne(nr.DbCtx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to mark notification %s as read for traveller %s: %w", notificationId, travellerId, err)
	}

	if result.ModifiedCount == 0 {
		return fmt.Errorf("notification %s not found or already read for traveller %s", notificationId, travellerId)
	}

	return nil // Return nil error on success
}

// MarkNotificationAsUnread finds a specific notification for a traveller and updates its status to "unread".
func (nr *NotificationRepository) MarkNotificationAsUnread(travellerId string, notificationId string) error {
	// Convert the notificationId string to a primitive.ObjectID
	objID, err := primitive.ObjectIDFromHex(notificationId)
	if err != nil {
		return fmt.Errorf("invalid notification ID format: %w", err)
	}

	filter := bson.M{
		"traveller_id": travellerId,
		"notifications._id": objID, // Match the notification within the array by its _id
	}

	update := bson.M{
		"$set": bson.M{
			"notifications.$.status": Domain.NotificationStatusUnread, // Use the positional operator
		},
	}

	// Perform the update operation
	result, err := nr.Collection.UpdateOne(nr.DbCtx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to mark notification %s as unread for traveller %s: %w", notificationId, travellerId, err)
	}

	if result.ModifiedCount == 0 {
		return fmt.Errorf("notification %s not found or already unread for traveller %s", notificationId, travellerId)
	}

	return nil // Return nil error on success
}

