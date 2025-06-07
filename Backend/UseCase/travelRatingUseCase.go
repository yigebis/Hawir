package UseCase

import "Hawir/Domain"

type TravelRatingUseCase struct {
	TravelRatingRepository ITravelRatingRepository
	ErrorService IErrorService
}

func NewTravelRatingUseCase(travelRatingRepo ITravelRatingRepository, errorService IErrorService) ITravelRatingUseCase {
	return &TravelRatingUseCase{
		TravelRatingRepository: travelRatingRepo,
		ErrorService: errorService,
	}
}

func (tru *TravelRatingUseCase) GetTravelRating(travelID string) (*Domain.TravelRating, int, error) {
	travelRating, err := tru.TravelRatingRepository.GetTravelRating(travelID)
	if err != nil {
		statusCode, err := tru.ErrorService.InternalServer()
		return nil, statusCode, err
	}

	statusCode, err := tru.ErrorService.NoError()
	return travelRating, statusCode, err
}
