package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type DriverRepository struct {
	DbCtx            context.Context
	DriverCollection *mongo.Collection
}

func NewDriverRepository(dbctx context.Context, driverCollection *mongo.Collection) UseCase.IDriverRepository {
	return &DriverRepository{
		DbCtx:            dbctx,
		DriverCollection: driverCollection,
	}
}

func (dr *DriverRepository) VerifyEmail(token string) error {
	filter := bson.M{"email": token}
	update := bson.M{"$set": bson.M{"verified": true}}
	_, err := dr.DriverCollection.UpdateOne(dr.DbCtx, filter, update)
	return err
}

func (dr *DriverRepository) AddDriver(driver *Domain.Driver) error {
	_, err := dr.DriverCollection.InsertOne(dr.DbCtx, driver)
	if err != nil {
		return err
	}
	return nil
}

func (dr *DriverRepository) GetDriverByID(id string) (*Domain.Driver, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": objID}
	var driver Domain.Driver
	err = dr.DriverCollection.FindOne(dr.DbCtx, filter).Decode(&driver)

	if err != nil {
		return nil, err
	}

	return &driver, nil
}

func (dr *DriverRepository) GetDriverByEmail(email string) (*Domain.Driver, error) {
	filter := bson.M{"email": email}
	var driver Domain.Driver
	err := dr.DriverCollection.FindOne(dr.DbCtx, filter).Decode(&driver)

	if err != nil {
		return nil, err
	}

	return &driver, nil
}

func (dr *DriverRepository) GetAllDriversByAgencyID(agencyID string) (*[]Domain.Driver, error) {
	filter := bson.M{"agency_id": agencyID}
	cursor, err := dr.DriverCollection.Find(dr.DbCtx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(dr.DbCtx)
	var drivers []Domain.Driver

	err = cursor.All(dr.DbCtx, &drivers)
	if err != nil {
		return nil, err
	}

	return &drivers, nil
}

func (dr *DriverRepository) AssignTrip(driverID, tripID string) error {
	driverObjID, err := primitive.ObjectIDFromHex(driverID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": driverObjID}
	update := bson.M{"$push": bson.M{"current_trips": tripID}}

	_, err = dr.DriverCollection.UpdateOne(dr.DbCtx, filter, update)
	return err
}

func (dr *DriverRepository) UpdateDriver(id string, driver *Domain.Driver) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	updatedData := bson.M{
		"first_name": driver.FirstName,
		"last_name": driver.LastName,
		"sex": driver.Sex,
		"date_of_birth": driver.DateOfBirth,
		"phone": driver.Phone,
	}
	if driver.Password != "" {
		updatedData["password"] = driver.Password
	}
	if driver.Photo != "" {
		updatedData["photo"] = driver.Photo
	}
	
	update := bson.M{"$set": updatedData}
	_, err = dr.DriverCollection.UpdateOne(dr.DbCtx, filter, update)
	return err
}

func (dr *DriverRepository) NullifyDriver(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{
		"current_trips": []string{},
		"verified":      false,
		"agency_id":     "",
		"password":      "",
	}}
	_, err = dr.DriverCollection.UpdateOne(dr.DbCtx, filter, update)
	return err
}

func (dr *DriverRepository) RemoveTripFromDriver(driverID, tripID string) error {
	driverObjID, err := primitive.ObjectIDFromHex(driverID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": driverObjID}
	update := bson.M{"$pull": bson.M{"current_trips": tripID}}

	_, err = dr.DriverCollection.UpdateOne(dr.DbCtx, filter, update)
	return err
}

func (dr *DriverRepository) EditPhoto(id string, url string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"photo": url}}
	_, err = dr.DriverCollection.UpdateOne(dr.DbCtx, filter, update)
	return err
}
