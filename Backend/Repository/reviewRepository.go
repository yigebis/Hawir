package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type ReviewRepository struct {
	DbCtx context.Context
	Collection *mongo.Collection
}

func NewReviewRepository(dbCtx context.Context, collection *mongo.Collection) UseCase.IReviewRepository {
	return &ReviewRepository{
		DbCtx: dbCtx,
		Collection: collection,
	}
}

func (rr *ReviewRepository) PostReview(review *Domain.RatingAndFeedback) error {
	_, err := rr.Collection.InsertOne(rr.DbCtx, review)
	if err != nil {
		return err
	}
	return nil
}

func (rr *ReviewRepository) GetReviewsForTravel(travelId string) ([]Domain.RatingAndFeedback, error) {
	filter := bson.M{"travel_id": travelId}
	
	cursor, err := rr.Collection.Find(rr.DbCtx, filter)
	if err != nil {
		return nil, err
	}

	var reviews []Domain.RatingAndFeedback
	cursor.All(rr.DbCtx, &reviews)
	return reviews, nil
}
