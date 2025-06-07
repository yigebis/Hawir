package UseCase

import "Hawir/Domain"

type IAgencyRatingUseCase interface {
	GetAgencyRating(agencyId string) (*Domain.AgencyRating, int, error) 
}

type IAgencyRatingRepository interface {
	GetAgencyRating(agencyId string) (*Domain.AgencyRating, error)
	EditRating(agencyRating *Domain.AgencyRating) error
	CreateAgencyRating(agencyRating *Domain.AgencyRating) error
}