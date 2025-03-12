package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type DestinationRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewDestinationRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.IDestinationRepository {
	return &DestinationRepository{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}

// AddDestination implements UseCase.IDestinationRepository.
func (dr *DestinationRepository) AddDestination(destination *Domain.Destination) error {
	destination.PostDate = time.Now()

	_, err := dr.Collection.InsertOne(dr.DbCtx, destination)
	if err != nil {
		fmt.Println(err.Error())
	}

	return err
}

// EditDestination implements UseCase.IDestinationRepository.
func (dr *DestinationRepository) EditDestination(destination *Domain.Destination) error {
	objId, err := primitive.ObjectIDFromHex(destination.ID.Hex())
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objId}
	updateData := bson.M{
		"name":               destination.Name,
		"latitude":           destination.Latitude,
		"longitude":          destination.Longitude,
		"description":        destination.Description,
		"hotels":             destination.Hotels,
		"culture":            destination.Culture,
		"history":            destination.History,
		"population":         destination.Population,
		"touristAttractions": destination.TouristAttractions,
		// Automatically set last_mod_time to now on update
		"last_mod_time": time.Now(),
	}

	update := bson.M{"$set": updateData}

	result, err := dr.Collection.UpdateOne(dr.DbCtx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("destination not found")
	}

	return nil
}

// ViewAllDestinations implements UseCase.IDestinationRepository.
func (dr *DestinationRepository) ViewAllDestinations() (*[]Domain.Destination, error) {
	panic("unimplemented")
}

// ViewDestinationById implements UseCase.IDestinationRepository.
func (dr *DestinationRepository) ViewDestinationById(id string) (*Domain.Destination, error) {
	objId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid destination id format")
	}

	filter := bson.M{"_id": objId}

	var destination Domain.Destination
	err = dr.Collection.FindOne(dr.DbCtx, filter).Decode(&destination)
	if err != nil {
		return nil, err
	}

	return &destination, nil
}
