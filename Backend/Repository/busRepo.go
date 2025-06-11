package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"

	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BusRepository struct {
	BusCollection *mongo.Collection
	DbCtx         context.Context
}

func NewBusRepository(collection *mongo.Collection, dbCtx context.Context) UseCase.IBusRepository {
	return &BusRepository{
		BusCollection: collection,
		DbCtx:         dbCtx,
	}
}

func (br *BusRepository) GetBusByID(id string) (*Domain.Bus, error) {
	var bus Domain.Bus
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": objID}
	err = br.BusCollection.FindOne(br.DbCtx, filter).Decode(&bus)
	if err != nil {
		return nil, err
	}
	return &bus, nil
}

func (br *BusRepository) GetBusByPlateNumber(plateNumber string) (*Domain.Bus, error) {
	var bus Domain.Bus
	filter := bson.M{"plate_number": plateNumber}
	err := br.BusCollection.FindOne(br.DbCtx, filter).Decode(&bus)
	if err != nil {
		return nil, err
	}
	return &bus, nil
}

func (br *BusRepository) AddBus(bus *Domain.Bus) error {
	_, err := br.BusCollection.InsertOne(br.DbCtx, bus)
	return err
}

func (br *BusRepository) EditBus(bus *Domain.Bus) error {
	filter := bson.M{"_id": bus.ID}
	update := bson.M{"$set": bus}
	_, err := br.BusCollection.UpdateOne(br.DbCtx, filter, update)
	return err
}

func (br *BusRepository) DeleteBus(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	_, err = br.BusCollection.DeleteOne(br.DbCtx, filter)
	return err
}

func (br *BusRepository) GetAllBusesByAgencyID(agencyID string) (*[]Domain.Bus, error) {
	var buses []Domain.Bus
	filter := bson.M{"agency_id": agencyID}
	cursor, err := br.BusCollection.Find(br.DbCtx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(br.DbCtx)

	err = cursor.All(br.DbCtx, &buses)
	if err != nil {
		return nil, err
	}

	return &buses, nil
}

func (br *BusRepository) AssignTrip(busRef string, tripID string) error {
	// objID, err := primitive.ObjectIDFromHex(id)
	// if err != nil {
	// 	return err
	// }

	filter := bson.M{"plate_number": busRef}
	update := bson.M{"$push": bson.M{"current_trips": tripID}}

	_, err := br.BusCollection.UpdateOne(br.DbCtx, filter, update)
	return err
}

func (br *BusRepository) RemoveTripFromBus(busID string, tripID string) error {
	objID, err := primitive.ObjectIDFromHex(busID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$pull": bson.M{"current_trips": tripID}}

	_, err = br.BusCollection.UpdateOne(br.DbCtx, filter, update)
	return err
}
