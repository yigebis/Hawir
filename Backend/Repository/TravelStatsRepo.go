package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"

	"context"

	"go.mongodb.org/mongo-driver/mongo"
)

type TravelStatsRepo struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewTravelStatsRepo(dbCtx context.Context, collection *mongo.Collection) UseCase.ITravelStatsRepository {
	return &TravelStatsRepo{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}

func (tsr *TravelStatsRepo) CreateTravelStats(travelStats *Domain.TravelStats) error {
	_, err := tsr.Collection.InsertOne(tsr.DbCtx, travelStats)
	return err
}
