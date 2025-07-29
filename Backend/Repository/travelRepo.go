package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"errors"
	"fmt"
	"time"

	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func (tr *TravelRepository) CreateTravel(travel *Domain.Travel) (string, error) {
	// fmt.Println("inside repo!")
	result, err := tr.Collection.InsertOne(tr.DbCtx, travel)
	if err != nil {
		fmt.Println(err.Error())
	}

	return result.InsertedID.(primitive.ObjectID).Hex(), err
}

func (tr *TravelRepository) EditTravel(travel *Domain.Travel) error {
	// we need to find the travel by id and update it
	// convert ID to ObjectID
	objId, err := primitive.ObjectIDFromHex(travel.ID.Hex())
	if err != nil {
		return err
	}

	// Create a filter to locate the document
	filter := bson.M{"_id": objId}

	// Build the update document explicitly, excluding the _id field.
	// Also, update the last_mod_time to the current time.
	updateData := bson.M{
		"start_location":     travel.StartLocation,
		"pickup_locations":   travel.PickupLocations,
		"destination":        travel.Destination,
		"planned_start_time": travel.PlannedStartTime,
		"actual_start_time": travel.ActualStartTime,
		"actual_arrival_time": travel.ActualArrivalTime,
		"est_arrival_time":   travel.EstArrivalTime,
		"price":              travel.Price,
		// "notice":             travel.Notice,
		"bus_ref": travel.BusRef,
		// "has_pay_back":       travel.HasPayBack,
		"driver_id": travel.DriverID,
		"total_seats": travel.TotalSeats,
		// Automatically set last_mod_time to now on update
		"last_mod_time": time.Now(),
		"status":        travel.Status,
	}

	update := bson.M{"$set": updateData}

	// update the travel
	result, err := tr.Collection.UpdateOne(tr.DbCtx, filter, update)
	// we need to return an error if the update fails
	if err != nil {
		return err
	}
	// we need to return an error if the travel is not found
	if result.MatchedCount == 0 {
		return errors.New("travel not found")
	}

	return nil
}

func (tr *TravelRepository) ViewTravelById(id string) (*Domain.Travel, error) {
	// we need to find the travel by id
	// Convert the string ID to ObjectID
	objId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid travel ID format")
	}

	filter := bson.M{"_id": objId}

	var travel Domain.Travel
	res := tr.Collection.FindOne(tr.DbCtx, filter)

	// we need to return an error if the travel is not found
	if res == nil {
		return nil, errors.New("travel not found")
	}

	err = res.Decode(&travel)
	if err != nil {
		return nil, err
	}

	return &travel, nil
}

func (tr *TravelRepository) ViewTravelsByAgencyId(agencyId string) (*[]Domain.Travel, error) {
	// we need to find the travels by agency id
	// objID, err := primitive.ObjectIDFromHex(agencyId)
	// if err != nil {
	// 	return nil, err
	// } // not required to convert to object id as we put the agency id in the database as a string

	filter := bson.M{"agency_id": agencyId}

	cursor, err := tr.Collection.Find(tr.DbCtx, filter)
	if err != nil {
		return nil, err
	}

	var travels []Domain.Travel
	cursor.All(tr.DbCtx, &travels)

	return &travels, nil
}

func (tr *TravelRepository) SearchTravel(searchParams *Domain.SearchParams) (*[]Domain.Travel, error) {
	//ensure agencyID is changed to objID
	filter := bson.M{"status": "upcoming"}

	if searchParams.AgencyID != "" {
		objID, err := primitive.ObjectIDFromHex(searchParams.AgencyID)
		if err != nil {
			return nil, err
		}

		filter["agency_id"] = objID
	}

	if searchParams.Destination != "" {
		filter["destination"] = searchParams.Destination
	}

	if searchParams.StartLocation != "" {
		filter["start_location"] = searchParams.StartLocation
	}

	if !(searchParams.DateMin.IsZero()) {
		minDate := searchParams.DateMin
		filter["planned_start_time"] = bson.M{"$gte": minDate}
	} else {
		now := time.Now()
		today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

		filter["planned_start_time"] = bson.M{"$gte": today}
	}

	if !(searchParams.DateMax.IsZero()) {
		maxDate := searchParams.DateMax
		filter["planned_start_time"] = bson.M{"$lte": maxDate}
	}

	if searchParams.PriceMin != "" {
		minPrice, err := primitive.ParseDecimal128(searchParams.PriceMin)
		if err != nil {
			return nil, err
		}

		filter["price"] = bson.M{"$gte": minPrice}
	}

	if searchParams.PriceMax != "" {
		maxPrice, err := primitive.ParseDecimal128(searchParams.PriceMax)
		if err != nil {
			return nil, err
		}

		filter["price"] = bson.M{"$lte": maxPrice}
	}

	if searchParams.HasPayBack {
		filter["has_pay_back"] = true
	}

	cursor, err := tr.Collection.Find(tr.DbCtx, filter)
	if err != nil {
		return nil, err
	}

	var travels []Domain.Travel
	err = cursor.All(tr.DbCtx, &travels)
	if err != nil {
		return nil, err
	}

	return &travels, nil
}

func (tr *TravelRepository) EditTravelStatus(travelID, status string) error {
	objectID, err := primitive.ObjectIDFromHex(travelID)
	if err != nil {
		return err
	}
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{
		"status": status,
	}}

	_, err = tr.Collection.UpdateOne(tr.DbCtx, filter, update)
	return err
}
