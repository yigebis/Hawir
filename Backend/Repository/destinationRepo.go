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
	"go.mongodb.org/mongo-driver/mongo/options"
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
func (dr *DestinationRepository) ViewAllDestinations(limit, skip int) (*[]Domain.Destination, int, error) {
	var destinations []Domain.Destination
	collection := dr.Collection

	// Count total documents
	total, err := collection.CountDocuments(dr.DbCtx, bson.M{})
	if err != nil {
		return nil, 0, err
	}

	// Query with pagination
	findOptions := options.Find().SetLimit(int64(limit)).SetSkip(int64(skip))
	cursor, err := collection.Find(dr.DbCtx, bson.M{}, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(dr.DbCtx)

	// Decode results into destinations slice
	if err := cursor.All(dr.DbCtx, &destinations); err != nil {
		return nil, 0, err
	}

	return &destinations, int(total), nil
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
