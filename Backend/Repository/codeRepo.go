package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type CodeRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
}

func NewCodeRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.ICodeRepository {
	return &CodeRepository{
		DbCtx:      dbCtx,
		Collection: collection,
	}
}

func (cr *CodeRepository) StoreCode(email, code string) error {
	var data Domain.CodeData
	data.Email = email
	data.Code = code

	_, err := cr.Collection.InsertOne(cr.DbCtx, data)
	if err != nil {
		return err
	}

	return nil
}

func (cr *CodeRepository) GetData(email string) (string, error) {
	var data Domain.CodeData
	err := cr.Collection.FindOne(cr.DbCtx, bson.M{"email": email}).Decode(&data)
	if err != nil {
		return "", err
	}

	return data.Code, nil
}

func (cr *CodeRepository) DeleteCode(email string) error {
	filter := bson.M{"email": email}
	_, err := cr.Collection.DeleteMany(cr.DbCtx, filter)
	return err
}
