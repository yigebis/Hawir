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
	DbCtx            context.Context
	AgencyCollection *mongo.Collection
	AdminCollection  *mongo.Collection
}

func NewAgencyRepository(dbctx context.Context, agencyCollection *mongo.Collection, adminCollection *mongo.Collection) UseCase.IAgencyRepository {
	return &AgencyRepository{
		DbCtx:            dbctx,
		AgencyCollection: agencyCollection,
		AdminCollection:  adminCollection,
	}
}

func (agr *AgencyRepository) AddAgency(agency *Domain.Agency) error {
	_, err := agr.AgencyCollection.InsertOne(agr.DbCtx, agency)
	return err
}

func (agr *AgencyRepository) EditAgency(agency *Domain.Agency) error {
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

	if agency.Password != "" {
		update["password"] = agency.Password
	}

	if agency.SuperAdminEmail != "" {
		update["super_admin_email"] = agency.SuperAdminEmail
	}

	_, err := agr.AgencyCollection.UpdateOne(agr.DbCtx, filter, bson.M{"$set": update})
	return err
}

func (agr *AgencyRepository) DeleteAgency(agencyID string) error {
	objID, err := primitive.ObjectIDFromHex(agencyID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	_, err = agr.AgencyCollection.DeleteOne(agr.DbCtx, filter)

	return err
}

func (agr *AgencyRepository) GetAgency(agencyID string) (*Domain.Agency, error) {
	var agency Domain.Agency

	objID, err := primitive.ObjectIDFromHex(agencyID)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": objID}
	err = agr.AgencyCollection.FindOne(agr.DbCtx, filter).Decode(&agency)
	return &agency, err
}

func (agr *AgencyRepository) GetAgencyByUniqueID(uniqueID string) (*Domain.Agency, error) {
	var agency Domain.Agency
	filter := bson.M{"unique_id": uniqueID}
	err := agr.AgencyCollection.FindOne(agr.DbCtx, filter).Decode(&agency)
	if err != nil {
		return nil, err
	}
	return &agency, nil
}

func (agr *AgencyRepository) GetAgencyAdmin(email string) (*Domain.Admins, error) {
	admin := Domain.Admins{}

	filter := bson.M{"email": email}
	err := agr.AdminCollection.FindOne(agr.DbCtx, filter).Decode(&admin)
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (agr *AgencyRepository) ResetAgencyAdminPassword(id primitive.ObjectID, newPassword string) error {
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"password": newPassword}}
	_, err := agr.AdminCollection.UpdateOne(agr.DbCtx, filter, update)
	return err
}

func (agr *AgencyRepository) GetAllAgencies() (*[]Domain.Agency, error) {
	var agencies []Domain.Agency

	cursor, err := agr.AgencyCollection.Find(agr.DbCtx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(agr.DbCtx)

	cursor.All(agr.DbCtx, &agencies)

	return &agencies, nil

}

func (agr *AgencyRepository) CheckAgency(agencyID string) (bool, error) {
	var agency Domain.Agency

	objID, err := primitive.ObjectIDFromHex(agencyID)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": objID}
	err = agr.AgencyCollection.FindOne(agr.DbCtx, filter).Decode(&agency)
	return true, err
}

func (agr *AgencyRepository) AddAgencyAdmin(admin *Domain.Admins) error {
	_, err := agr.AdminCollection.InsertOne(agr.DbCtx, admin)
	return err
}

func (agr *AgencyRepository) EditAgencyAdmin(admin *Domain.Admins) error {
	filter := bson.M{"email": admin.Email}
	update := bson.M{"$set": bson.M{
		"email":    admin.Email,
		"password": admin.Password,
	}}
	_, err := agr.AdminCollection.UpdateOne(agr.DbCtx, filter, update)
	return err
}
