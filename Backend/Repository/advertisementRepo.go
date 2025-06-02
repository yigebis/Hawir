package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AdvertisementRepository struct {
	Collection *mongo.Collection
	Ctx        context.Context
}

func NewAdvertisementRepository(collection *mongo.Collection, ctx context.Context) UseCase.IAdvertisementRepository {
	return &AdvertisementRepository{
		Collection: collection,
		Ctx:        ctx,
	}
}

func (ar *AdvertisementRepository) AddAdvertisement(ad *Domain.Advertisement) error {
	_, err := ar.Collection.InsertOne(ar.Ctx, ad)
	if err != nil {
		return err
	}
	return nil
}

func (ar *AdvertisementRepository) GetAdvertisementByID(id string) (*Domain.Advertisement, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": objID}
	var ad Domain.Advertisement

	err = ar.Collection.FindOne(ar.Ctx, filter).Decode(&ad)
	if err != nil {
		return nil, err
	}
	return &ad, nil
}

func (ar *AdvertisementRepository) GetAllAdvertisements() (*[]Domain.Advertisement, error) {
	cursor, err := ar.Collection.Find(ar.Ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	var ads []Domain.Advertisement
	if err = cursor.All(ar.Ctx, &ads); err != nil {
		return nil, err
	}

	return &ads, nil
}

func (ar *AdvertisementRepository) GetAllAgencyAdvertisements(agencyID string) (*[]Domain.Advertisement, error) {
	filter := bson.M{"agency_id": agencyID}
	cursor, err := ar.Collection.Find(ar.Ctx, filter)
	if err != nil {
		return nil, err
	}

	var ads []Domain.Advertisement
	if err = cursor.All(ar.Ctx, &ads); err != nil {
		return nil, err
	}

	return &ads, nil
}

func (ar *AdvertisementRepository) DeleteAdvertisement(id string, agencyID string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID, "agency_id": agencyID}
	_, err = ar.Collection.DeleteOne(ar.Ctx, filter)
	if err != nil {
		return err
	}

	return nil
}
