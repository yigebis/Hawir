package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AgencyRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewAgencyRepository(dbctx context.Context, collection *mongo.Collection) UseCase.IAgencyRepository {
	return &AgencyRepository{
		DbCtx:      dbctx,
		Collection: collection,
	}
}

func (admr *AgencyRepository) AddAgency(agency *Domain.Agency) error {
	_, err := admr.Collection.InsertOne(admr.DbCtx, agency)
	return err
}

func (admr *AgencyRepository) EditAgency(agency *Domain.Agency) error {
	filter := bson.M{"_id": agency.ID}

	update := bson.M{}

	if agency.Name != "" {
		update["name"] = agency.Name
	}

	if agency.Services != nil {
		update["services"] = agency.Services
	}

	if agency.LogoURL != "" {
		update["logo_url"] = agency.LogoURL
	}

	if agency.Description != "" {
		update["description"] = agency.Description
	}

	if agency.Contact != nil {
		update["contact"] = agency.Contact
	}

	if agency.Language != "" {
		update["language"] = agency.Language
	}

	if agency.Calendar != "" {
		update["calendar"] = agency.Calendar
	}

	_, err := admr.Collection.UpdateOne(admr.DbCtx, filter, bson.M{"$set": update})
	return err
}

func (admr *AgencyRepository) DeleteAgency(agencyID string) error {
	objID, err := primitive.ObjectIDFromHex(agencyID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	_, err = admr.Collection.DeleteOne(admr.DbCtx, filter)

	return err
}

func (admr *AgencyRepository) GetAgency(agencyID string) (*Domain.Agency, error) {
	var agency Domain.Agency

	objID, err := primitive.ObjectIDFromHex(agencyID)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": objID}
	err = admr.Collection.FindOne(admr.DbCtx, filter).Decode(&agency)
	return &agency, err
}

func (admr *AgencyRepository) GetAllAgencies() (*[]Domain.Agency, error) {
	var agencies []Domain.Agency

	cursor, err := admr.Collection.Find(admr.DbCtx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(admr.DbCtx)

	cursor.All(admr.DbCtx, &agencies)

	return &agencies, nil

}

func (admr *AgencyRepository) CheckAgency(agencyID string) (bool, error) {
	var agency Domain.Agency

	objID, err := primitive.ObjectIDFromHex(agencyID)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": objID}
	err = admr.Collection.FindOne(admr.DbCtx, filter).Decode(&agency)
	return true, err
}
