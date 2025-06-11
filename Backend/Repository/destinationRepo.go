package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type DestinationRepository struct {
	DbCtx                 context.Context
	DestinationCollection *mongo.Collection
	DetailsCollection     *mongo.Collection
}

func NewDestinationRepository(dbCtx context.Context, destinationCollection, detailsCollection *mongo.Collection) UseCase.IDestinationRepository {
	return &DestinationRepository{
		DbCtx:                 dbCtx,
		DestinationCollection: destinationCollection,
		DetailsCollection:     detailsCollection,
	}
}

// AddDestination implements UseCase.IDestinationRepository.
func (dr *DestinationRepository) AddDestination(destination *Domain.Destination) (*Domain.Destination, error) {
	// add the destination to the repo
	res, err := dr.DestinationCollection.InsertOne(dr.DbCtx, destination)
	if err != nil {
		return nil, err
	}

	// return the ID of the added destination
	objID, ok := res.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, errors.New("failed to convert inserted ID to ObjectID")
	}

	destination.ID = objID
	return destination, nil
}

func (dr *DestinationRepository) InitializeDestinationDetails(id string) error {
	destinationDetails := Domain.DestinationDetails{
		DestinationID: id,
		PostDate:      time.Now(),
	}

	_, err := dr.DetailsCollection.InsertOne(dr.DbCtx, destinationDetails)
	return err
}

// EditDestination implements UseCase.IDestinationRepository.
func (dr *DestinationRepository) EditDestination(destination *Domain.Destination) error {
	filter := bson.M{"_id": destination.ID}
	updateData := bson.M{
		"name":     destination.Name,
		"image" : destination.Image,
		"stations": destination.Stations,
	}

	update := bson.M{"$set": updateData}

	result, err := dr.DestinationCollection.UpdateOne(dr.DbCtx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("destination not found")
	}

	return nil
}

func (dr *DestinationRepository) DeleteDestination(id string) error {
	objId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objId}
	results, err := dr.DestinationCollection.DeleteOne(dr.DbCtx, filter)
	if err != nil || results.DeletedCount == 0 {
		return errors.New("error while deleting")
	}

	filter = bson.M{"destination_id": id}
	_, err = dr.DetailsCollection.DeleteOne(dr.DbCtx, filter)
	return err
}

// ViewDestinationById implements UseCase.IDestinationRepository.
func (dr *DestinationRepository) GetDestinationByID(id string) (*Domain.Destination, error) {
	objId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid destination id format")
	}

	filter := bson.M{"_id": objId}

	var destination Domain.Destination
	err = dr.DestinationCollection.FindOne(dr.DbCtx, filter).Decode(&destination)
	if err != nil {
		return nil, err
	}

	return &destination, nil
}

func (dr *DestinationRepository) GetDestinationByName(name string) (*Domain.Destination, error) {
	filter := bson.M{
		"name": bson.M{
			"$regex":   "^" + name + "$",
			"$options": "i",
		},
	}

	var destination Domain.Destination
	err := dr.DestinationCollection.FindOne(dr.DbCtx, filter).Decode(&destination)
	if err != nil {
		return nil, err
	}
	return &destination, nil
}

func (dr *DestinationRepository) GetDestinationDetailsByID(id string) (*Domain.DestinationDetails, error) {
	filter := bson.M{"destination_id": id}

	var details Domain.DestinationDetails
	err := dr.DetailsCollection.FindOne(dr.DbCtx, filter).Decode(&details)
	if err != nil {
		return nil, err
	}

	return &details, nil
}

func (dr *DestinationRepository) EditDestinationDetails(destinationDetails *Domain.DestinationDetails) error {
	filter := bson.M{"destination_id": destinationDetails.DestinationID}
	updateData := bson.M{
		"latitude":    destinationDetails.Latitude,
		"longitude":   destinationDetails.Longitude,
		"description": destinationDetails.Description,
		"hotels":      destinationDetails.Hotels,
		"culture":     destinationDetails.Culture,
		"history":     destinationDetails.History,
		// "population":         destinationDetails.Population,
		"tourist_attractions": destinationDetails.TouristAttractions,
	}

	update := bson.M{"$set": updateData}

	result, err := dr.DetailsCollection.UpdateOne(dr.DbCtx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("destination details not found")
	}

	return nil
}

func (dr *DestinationRepository) UpdateStations(destinationID string, stations *map[string]bool) error {
	objID, err := primitive.ObjectIDFromHex(destinationID)
	if err != nil {
		return err
	}

	// Convert the map to a slice of strings
	var stationsSlice []string
	for station := range *stations {
		stationsSlice = append(stationsSlice, station)
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"stations": stationsSlice}}

	result, err := dr.DestinationCollection.UpdateOne(dr.DbCtx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("destination details not found")
	}

	return nil
}

func (dr *DestinationRepository) GetAllDestinations() (*[]Domain.Destination, error) {
	destinations := []Domain.Destination{}
	cursor, err := dr.DestinationCollection.Find(dr.DbCtx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(dr.DbCtx)

	for cursor.Next(dr.DbCtx) {
		var destination Domain.Destination
		if err := cursor.Decode(&destination); err != nil {
			return nil, err
		}
		destinations = append(destinations, destination)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return &destinations, nil
}

// ViewAllDestinations implements UseCase.IDestinationRepository.
// func (dr *DestinationRepository) ViewAllDestinations(limit, skip int) (*[]Domain.Destination, int, error) {
// 	var destinations []Domain.Destination
// 	collection := dr.Collection

// 	// Count total documents
// 	total, err := collection.CountDocuments(dr.DbCtx, bson.M{})
// 	if err != nil {
// 		return nil, 0, err
// 	}

// 	// Query with pagination
// 	findOptions := options.Find().SetLimit(int64(limit)).SetSkip(int64(skip))
// 	cursor, err := collection.Find(dr.DbCtx, bson.M{}, findOptions)
// 	if err != nil {
// 		return nil, 0, err
// 	}
// 	defer cursor.Close(dr.DbCtx)

// 	// Decode results into destinations slice
// 	if err := cursor.All(dr.DbCtx, &destinations); err != nil {
// 		return nil, 0, err
// 	}

// 	return &destinations, int(total), nil
// }
