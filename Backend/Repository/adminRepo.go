package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type AdminRepository struct {
	adminCollection *mongo.Collection
}

func NewAdminRepository(admc *mongo.Collection) UseCase.IAdminRepo {
	return &AdminRepository{
		adminCollection: admc,
	}
}

func (ar *AdminRepository) GetAdminByEmail(email string) (*Domain.Admin, error) {
	filter := bson.M{"email": email}
	admin := Domain.Admin{}
	err := ar.adminCollection.FindOne(context.Background(), filter).Decode(&admin)
	if err != nil {
		return nil, err
	}

	return &admin, nil
}
