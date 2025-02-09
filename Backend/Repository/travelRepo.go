package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"fmt"

	"context"

	// "go.mongodb.org/mongo-driver/bson"
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
	// we need to return an error if the travel is not found
	// we need to return an error if the update fails
	return nil
}

func (tr *TravelRepository) ViewTravelById(id string) (*Domain.Travel, error) {
	// we need to find the travel by id
	// we need to return an error if the travel is not found
	return nil, nil
}

func (tr *TravelRepository) ViewTravelsByAgencyId(agencyId string) ([]Domain.Travel, error) {
	// we need to find the travels by agency id
	return nil, nil
}
