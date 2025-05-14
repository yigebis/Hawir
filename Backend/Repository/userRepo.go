package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"errors"
	"fmt"

	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewUserRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.IUserRepository {
	return &UserRepository{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}

func (ur *UserRepository) CreateUser(user *Domain.User) error {
	_, err := ur.Collection.InsertOne(ur.DbCtx, user)
	if err != nil {
		fmt.Println(err.Error())
	}
	return err
}

func (ur *UserRepository) GetUserByEmail(email string) (*Domain.User, error) {
	var user Domain.User
	filter := bson.M{"email": email}
	err := ur.Collection.FindOne(ur.DbCtx, filter).Decode(&user)

	if err != nil {
		// fmt.Println(err.Error())
		return nil, err
	}

	return &user, nil
}

func (ur *UserRepository) GetUserByPhoneNumber(phoneNumber string) (*Domain.User, error) {
	var user Domain.User
	filter := bson.M{"phone_number": phoneNumber}

	err := ur.Collection.FindOne(ur.DbCtx, filter).Decode(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (ur *UserRepository) VerifyUser(email string) error {
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{
		"verified": true,
	}}

	_, err := ur.Collection.UpdateOne(ur.DbCtx, filter, update)
	// fmt.Println(err)
	return err
}

func (ur *UserRepository) DeleteUserByEmail(email string) error {
	filter := bson.M{"email": email}
	_, err := ur.Collection.DeleteOne(ur.DbCtx, filter)
	return err
}

func (ur *UserRepository) GetUserById(id string) (*Domain.User, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid user ID format")
	}

	filter := bson.M{"_id": objID}

	var user Domain.User
	res := ur.Collection.FindOne(ur.DbCtx, filter)

	if res == nil {
		return nil, errors.New("user not found")
	}

	err = res.Decode(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (ur *UserRepository) EditUser(user *Domain.UserProfile) error {
	objID, err := primitive.ObjectIDFromHex(user.ID.Hex())
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	updateData := bson.M{
		"first_name":         user.FirstName,
		"last_name":          user.LastName,
		"favourite_agencies": user.FavouriteAgencies,
		// "email": user.Email,
		// "phone_number": user.PhoneNumber,
		"profile_photo": user.ProfilePhoto,
	}

	update := bson.M{"$set": updateData}

	result, err := ur.Collection.UpdateOne(ur.DbCtx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("user not found")
	}

	return nil
}

func (ur *UserRepository) ChangePassword(id primitive.ObjectID, password string) error {
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"password": password}}

	result, err := ur.Collection.UpdateOne(ur.DbCtx, filter, update)

	if result.MatchedCount == 0 {
		return errors.New("user not found")
	}

	return err
}

// StoreUserFCMToken adds an FCM token to the user's document
func (ur *UserRepository) StoreUserFCMToken(userID string, fcmToken string) error {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	// To avoid duplicate tokens, check if it exists first
	filter := bson.M{"_id": objectID, "fcm_tokens": bson.M{"$ne": fcmToken}}
	update := bson.M{"$push": bson.M{"fcm_tokens": fcmToken}}

	_, err = ur.Collection.UpdateOne(ur.DbCtx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to store FCM token for user %s: %w", userID, err)
	}
	fmt.Printf("FCM token stored for user %s: %s\n", userID, fcmToken)
	return nil
}

// RemoveUserFCMToken removes a specific FCM token from the user's document
func (ur *UserRepository) RemoveUserFCMToken(userID string, fcmToken string) error {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	update := bson.M{"$pull": bson.M{"fcm_tokens": fcmToken}}

	_, err = ur.Collection.UpdateOne(ur.DbCtx, bson.M{"_id": objectID}, update)
	if err != nil {
		return fmt.Errorf("failed to remove FCM token for user %s: %w", userID, err)
	}
	fmt.Printf("FCM token removed for user %s: %s\n", userID, fcmToken)
	return nil
}

// GetUserFCMTokens retrieves all FCM tokens for a given user ID
func (ur *UserRepository) GetUserFCMTokens(userID string) ([]string, error) {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	var user Domain.User
	err = ur.Collection.FindOne(ur.DbCtx, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found with ID %s: %w", userID, err)
		}
		return nil, fmt.Errorf("failed to retrieve user %s: %w", userID, err)
	}
	return user.FcmTokens, nil
}