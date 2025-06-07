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

type AgencyRatingRepository struct {
	DbCtx context.Context
	Collection *mongo.Collection
}

func NewAgencyRatingRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.IAgencyRatingRepository {
	return &AgencyRatingRepository{
		DbCtx: dbCtx,
		Collection: collection,
	}
}

func (asr *AgencyRatingRepository) 	GetAgencyRating(agencyId string) (*Domain.AgencyRating, error) {
	filter := bson.M{"agency_id": agencyId}
	var agencyStatistics Domain.AgencyRating
	err := asr.Collection.FindOne(asr.DbCtx, filter).Decode(&agencyStatistics)
	if err != nil {
		return nil, err
	}

	return &agencyStatistics, nil
}

func (asr *AgencyRatingRepository) 	EditRating(agencyStatistics *Domain.AgencyRating) error {
	objId, err := primitive.ObjectIDFromHex(agencyStatistics.ID.Hex())
	if err != nil {
		return errors.New("invalid ID format")
	}

	filter := bson.M{"_id": objId}
	update := bson.M{"$set": agencyStatistics}

	result, err := asr.Collection.UpdateOne(asr.DbCtx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("agency statistics not found")
	}

	return nil
}

func (asr *AgencyRatingRepository) CreateAgencyRating(agencyStat *Domain.AgencyRating) error {
	_, err := asr.Collection.InsertOne(asr.DbCtx, agencyStat)
	return err
}
