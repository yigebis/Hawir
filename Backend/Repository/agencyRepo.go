package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AgencyRepository struct {
	DbCtx            context.Context
	AgencyCollection *mongo.Collection
	AdminCollection  *mongo.Collection
	BusCollection    *mongo.Collection
}

func NewAgencyRepository(dbctx context.Context, agencyCollection *mongo.Collection, adminCollection *mongo.Collection, busCollection *mongo.Collection) UseCase.IAgencyRepository {
	return &AgencyRepository{
		DbCtx:            dbctx,
		AgencyCollection: agencyCollection,
		AdminCollection:  adminCollection,
		BusCollection:    busCollection,
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

func (agr *AgencyRepository) GetAgencyAdmin(email string) (*Domain.AgencyAdmin, error) {
	admin := Domain.AgencyAdmin{}

	filter := bson.M{"email": email}
	err := agr.AdminCollection.FindOne(agr.DbCtx, filter).Decode(&admin)
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (agr *AgencyRepository) ResetAgencyAdminPassword(email string, newPassword string) error {
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"password": newPassword}}
	_, err := agr.AdminCollection.UpdateOne(agr.DbCtx, filter, update)
	if err != nil {
		return err
	}
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

func (agr *AgencyRepository) CheckAgencyByUniqueID(agencyID string) (bool, error) {
	var agency Domain.Agency

	filter := bson.M{"unique_id": agencyID}
	err := agr.AgencyCollection.FindOne(agr.DbCtx, filter).Decode(&agency)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, nil // Agency not found
		}
		return false, err
	}
	return true, nil
}

func (agr *AgencyRepository) AddAgencyAdmin(admin *Domain.AgencyAdmin) error {
	_, err := agr.AdminCollection.InsertOne(agr.DbCtx, admin)
	return err
}

func (agr *AgencyRepository) EditAgencyAdmin(admin *Domain.AgencyAdmin) error {
	filter := bson.M{"email": admin.Email}
	update := bson.M{"$set": bson.M{
		"email":    admin.Email,
		"password": admin.Password,
	}}
	_, err := agr.AdminCollection.UpdateOne(agr.DbCtx, filter, update)
	return err
}

func (agr *AgencyRepository) GetAgencyForUserById(agencyId string) (*Domain.AgencyDisplay, error) {
	objId, err := primitive.ObjectIDFromHex(agencyId)
	if err != nil {
		return nil, errors.New("invalid agency ID format")
	}

	filter := bson.M{"_id": objId}
	var agency Domain.Agency
	res := agr.AgencyCollection.FindOne(agr.DbCtx, filter)

	if res == nil {
		return nil, errors.New("agency not found")
	}

	err = res.Decode(&agency)

	if err != nil {
		return nil, err
	}

	var agencyDisplay Domain.AgencyDisplay
	agencyDisplay.ID = agency.ID
	agencyDisplay.Name = agency.Name
	agencyDisplay.Services = agency.Services
	agencyDisplay.LogoURL = agency.LogoURL
	agencyDisplay.Description = agency.Description
	agencyDisplay.Contact = agency.Contact

	return &agencyDisplay, nil
}

func (agr *AgencyRepository) AddBus(bus *Domain.Bus) error {
	_, err := agr.BusCollection.InsertOne(agr.DbCtx, bus)
	return err
}

func (agr *AgencyRepository) EditBus(bus *Domain.Bus) error {
	filter := bson.M{"_id": bus.ID}
	update := bson.M{"$set": bus}
	_, err := agr.BusCollection.UpdateOne(agr.DbCtx, filter, update)
	return err
}

func (agr *AgencyRepository) DeleteBus(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	_, err = agr.BusCollection.DeleteOne(agr.DbCtx, filter)
	return err
}

func (agr *AgencyRepository) GetBusByID(id string) (*Domain.Bus, error) {
	var bus Domain.Bus
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": objID}
	err = agr.BusCollection.FindOne(agr.DbCtx, filter).Decode(&bus)
	if err != nil {
		return nil, err
	}
	return &bus, nil
}

func (agr *AgencyRepository) GetBusByPlateNumber(plateNumber string) (*Domain.Bus, error) {
	var bus Domain.Bus
	filter := bson.M{"plate_number": plateNumber}
	err := agr.BusCollection.FindOne(agr.DbCtx, filter).Decode(&bus)
	if err != nil {
		return nil, err
	}
	return &bus, nil
}

func (agr *AgencyRepository) GetAllBusesByAgencyID(agencyID string) (*[]Domain.Bus, error) {
	var buses []Domain.Bus
	objID, err := primitive.ObjectIDFromHex(agencyID)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"agency_id": objID}
	cursor, err := agr.BusCollection.Find(agr.DbCtx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(agr.DbCtx)

	err = cursor.All(agr.DbCtx, &buses)
	if err != nil {
		return nil, err
	}

	return &buses, nil
}
