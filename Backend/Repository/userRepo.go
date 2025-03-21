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

func (ur *UserRepository) VerifyUser(user *Domain.User) error {
	filter := bson.M{"email": user.Email}
	update := bson.M{"$set": bson.M{
		"verified": true,
	}}

	_, err := ur.Collection.UpdateOne(ur.DbCtx, filter, update)
	fmt.Println(err)
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
