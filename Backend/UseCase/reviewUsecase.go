package UseCase

import (
	"Hawir/Domain"
	"time"
)

type ReviewUseCase struct {
	ReviewRepo       IReviewRepository
	UserRepo         IUserRepository
	AgencyRatingRepo   IAgencyRatingRepository
	TravelRatingRepo ITravelRatingRepository
	ErrorService     IErrorService
}

func NewReviewUseCase(rvr IReviewRepository, ur IUserRepository, asr IAgencyRatingRepository, tr ITravelRatingRepository, errorService IErrorService) IReviewUseCase {
	return &ReviewUseCase{
		ReviewRepo:       rvr,
		UserRepo:         ur,
		AgencyRatingRepo:   asr,
		TravelRatingRepo: tr,
		ErrorService:     errorService,
	}
}

func (rvu *ReviewUseCase) PostReview(review *Domain.RatingAndFeedback) (int, error) {
	// check if user exists
	user, err := rvu.UserRepo.GetUserById(review.TravelerID)
	if err != nil {
		return rvu.ErrorService.InternalServer()
	}
	if user == nil {
		return rvu.ErrorService.UserNotFound()
	}

	travelRating, err := rvu.TravelRatingRepo.GetTravelRating(review.TravelID)
	if err != nil {
		return rvu.ErrorService.InternalServer()
	}

	// save rating for travel
	travelRating.TotalRatingCount += 1
	travelRating.TotalRatingSum += review.Rating
	travelRating.Rating = float64(travelRating.TotalRatingSum) / float64(travelRating.TotalRatingCount)

	err = rvu.TravelRatingRepo.EditTravelRating(travelRating)
	if err != nil {
		return rvu.ErrorService.InternalServer()
	}

	// save rating for agency
	agencyStats, err := rvu.AgencyRatingRepo.GetAgencyRating(review.AgencyID)
	if err != nil {
		return rvu.ErrorService.InternalServer()
	}

	agencyStats.TotalRatingCount += 1
	agencyStats.TotalRatingSum += review.Rating
	agencyStats.Rating = float64(agencyStats.TotalRatingSum) / float64(agencyStats.TotalRatingCount)
	err = rvu.AgencyRatingRepo.EditRating(agencyStats)
	if err != nil {
		return rvu.ErrorService.InternalServer()
	}

	// save comment
	review.PostTime = time.Now()
	err = rvu.ReviewRepo.PostReview(review)
	if err != nil {
		return rvu.ErrorService.InternalServer()
	}

	return rvu.ErrorService.NoError()
}

func (rvu *ReviewUseCase) GetReviewsForTravel(travelId string) ([]Domain.RatingAndFeedback, int, error) {
	reviews, err := rvu.ReviewRepo.GetReviewsForTravel(travelId)
	if err != nil {
		statusCode, err := rvu.ErrorService.InternalServer()
		return nil, statusCode, err
	}

	statusCode, err := rvu.ErrorService.NoError()
	return reviews, statusCode, err
}
