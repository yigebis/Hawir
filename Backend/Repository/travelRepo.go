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

func NewTravelRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.ITravelRepository{
	return &TravelRepository{
		DbCtx: dbCtx,
		Collection: collection,
	}
}



func (tr *TravelRepository) CreateTravel(travel *Domain.Travel) error{
	_, err := tr.Collection.InsertOne(tr.DbCtx, travel)
	if err != nil {
		fmt.Println(err.Error())
	}
	return err
}

// GetTravelByTravelName :- we need to get a Travel by name. there needs to be another property inside Travel