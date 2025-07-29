package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BusTrackingRepository struct {
	Collection *mongo.Collection
	Context    context.Context
}

func NewBusTrackingRepository(collection *mongo.Collection, ctx context.Context) UseCase.IBusTrackingRepository {
	return &BusTrackingRepository{
		Collection: collection,
		Context:    ctx,
	}
}

func (btr *BusTrackingRepository) SaveBusTracking(tracking *Domain.BusTracking) error {
	filter := bson.M{"bus_id": tracking.BusID}
	update := bson.M{
		"$set": bson.M{
			"latitude":  tracking.Latitude,
			"longitude": tracking.Longitude,
			"timestamp": tracking.Timestamp,
		},
	}
	options := options.Update().SetUpsert(true)
	_, err := btr.Collection.UpdateOne(btr.Context, filter, update, options)
	return err
}
