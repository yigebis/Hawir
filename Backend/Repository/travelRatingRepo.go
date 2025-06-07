package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TravelRatingRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewTravelRatingRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.ITravelRatingRepository {
	return &TravelRatingRepository{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}

func (trr *TravelRatingRepository) GetTravelRating(travelID string) (*Domain.TravelRating, error) {
	filter := bson.M{"travel_id": travelID}
	var travelRating Domain.TravelRating
	
	err := trr.Collection.FindOne(trr.DbCtx, filter).Decode(&travelRating)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // No travel rating found
		}
		return nil, err // Other error
	}

	return &travelRating, nil
}

func (trr *TravelRatingRepository) EditTravelRating(travelRating *Domain.TravelRating) error {
	objId, err := primitive.ObjectIDFromHex(travelRating.ID.Hex())
	if err != nil {
		return err
	}
	filter := bson.M{"_id": objId}
	update := bson.M{"$set": travelRating}

	result, err := trr.Collection.UpdateOne(trr.DbCtx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("travel rating not found")
	}

	return nil
}

func (trr *TravelRatingRepository) CreateTravelRating(travelRating *Domain.TravelRating) error {
	_, err := trr.Collection.InsertOne(trr.DbCtx, travelRating)
	if err != nil {
		return err
	}

	return nil
}
