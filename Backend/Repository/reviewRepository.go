package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type ReviewRepository struct {
	DbCtx      context.Context
	Collection *mongo.Collection
	UserRepo   UseCase.IUserRepository
}

func NewReviewRepository(dbCtx context.Context, collection *mongo.Collection, userRepo UseCase.IUserRepository) UseCase.IReviewRepository {
	return &ReviewRepository{
		DbCtx:      dbCtx,
		Collection: collection,
		UserRepo:   userRepo,
	}
}

func (rr *ReviewRepository) PostReview(review *Domain.RatingAndFeedback) error {
	_, err := rr.Collection.InsertOne(rr.DbCtx, review)
	if err != nil {
		return err
	}
	return nil
}

func (rr *ReviewRepository) GetReviewsForTravel(travelId string) ([]Domain.RatingAndFeedbackDisplay, error) {
	filter := bson.M{"travel_id": travelId}

	cursor, err := rr.Collection.Find(rr.DbCtx, filter)
	if err != nil {
		return nil, err
	}

	var reviews []Domain.RatingAndFeedbackDisplay
	defer cursor.Close(rr.DbCtx)
	for cursor.Next(rr.DbCtx) {
		var review Domain.RatingAndFeedback
		err := cursor.Decode(&review)
		if err != nil {
			return nil, err
		}
		userInfo, err := rr.UserRepo.GetUserById(review.TravelerID)
		if err != nil {
			return nil, err
		}

		reviewDisplay := Domain.RatingAndFeedbackDisplay{
			Comment:       review.Comment,
			Rating:        review.Rating,
			TravelID:      review.TravelID,
			TravelerName:  userInfo.FirstName + " " + userInfo.LastName,
			TravelerPhoto: userInfo.ProfilePhoto,
			PostTime:      review.PostTime,
		}
		reviews = append(reviews, reviewDisplay)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return reviews, nil
}
