package UseCase

import "Hawir/Domain"

type IReviewUseCase interface {
	PostReview(review *Domain.RatingAndFeedback) (int, error)
	GetReviewsForTravel(travelId string) ([]Domain.RatingAndFeedbackDisplay, int, error)
}

type IReviewRepository interface {
	PostReview(review *Domain.RatingAndFeedback) error
	GetReviewsForTravel(travelId string) ([]Domain.RatingAndFeedbackDisplay, error)
}