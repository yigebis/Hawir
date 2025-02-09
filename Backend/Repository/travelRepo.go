package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"fmt"

	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type TravelRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewTravelRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.ITravelRepository {
	return &TravelRepository{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}

func (tr *TravelRepository) CreateTravel(travel *Domain.Travel) error {
	_, err := tr.Collection.InsertOne(tr.DbCtx, travel)
	if err != nil {
		fmt.Println(err.Error())
	}
	return err
}

func (tr *TravelRepository) EditTravel(travel *Domain.Travel) error {
	// we need to find the travel by id and update it
	// convert ID to ObjectID
	objId, err := primitive.ObjectIDFromHex(travel.ID.Hex())
	if err != nil {
		return err
	}
	// create a filter for the update
	filter := bson.M{"_id":objId}

	update := bson.M {"$set": travel}
	// update the travel
	result, err := tr.Collection.UpdateOne(tr.DbCtx, filter, update)
	// we need to return an error if the update fails
	if err != nil {
		return err
	}
	// we need to return an error if the travel is not found
	if result.ModifiedCount == 0 {
		return ErrorService.TravelNotFound()
	}
	return nil
}

func (tr *TravelRepository) ViewTravelById(id string) (*Domain.Travel, error) {
	// we need to find the travel by id
	var travel Domain.Travel
	filter := bson.M{"_id": id}

	err := tr.Collection.FindOne(tr.DbCtx, filter).Decode(&travel)
	if err != nil {
		return nil, err
	}
	// we need to return an error if the travel is not found
	return &travel, nil
}

func (tr *TravelRepository) ViewTravelsByAgencyId(agencyId string) ([]Domain.Travel, error) {
	// we need to find the travels by agency id
	return nil, nil
}
