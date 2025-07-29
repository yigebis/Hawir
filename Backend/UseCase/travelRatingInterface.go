package UseCase

import "Hawir/Domain"

type ITravelRatingUseCase interface {
	GetTravelRating(travelID string) (*Domain.TravelRating, int, error)
}

type ITravelRatingRepository interface {
	GetTravelRating(travelID string) (*Domain.TravelRating, error)
	EditTravelRating(travelRating *Domain.TravelRating) error
	CreateTravelRating(travelRating *Domain.TravelRating) error
}
