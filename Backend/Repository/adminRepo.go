package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type AdminRepository struct {
	DbContext       context.Context
	AdminCollection *mongo.Collection
}

func NewAdminRepository(dbCtx context.Context, admc *mongo.Collection) UseCase.IAdminRepo {
	return &AdminRepository{
		AdminCollection: admc,
		DbContext:       dbCtx,
	}
}

func (ar *AdminRepository) GetAdminByEmail(email string) (*Domain.Admin, error) {
	filter := bson.M{"email": email}
	admin := Domain.Admin{}
	err := ar.AdminCollection.FindOne(context.Background(), filter).Decode(&admin)
	if err != nil {
		return nil, err
	}

	return &admin, nil
}

func (ar *AdminRepository) ChangePassword(email, hashedPassword, hashedPassword2 string) error {
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{
		"password":  hashedPassword,
		"password2": hashedPassword2,
	}}
	_, err := ar.AdminCollection.UpdateOne(ar.DbContext, filter, update)
	if err != nil {
		return err
	}

	return nil
}
