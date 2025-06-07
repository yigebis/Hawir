package UseCase

import "Hawir/Domain"

type AgencyRatingUseCase struct {
	AgencyRatingRepo IAgencyRatingRepository
	ErrorService   IErrorService
}

func NewAgencyRatingUseCase(agencyRatingRepo IAgencyRatingRepository, errorService IErrorService) IAgencyRatingUseCase {
	return &AgencyRatingUseCase{
		AgencyRatingRepo: agencyRatingRepo,
		ErrorService:   errorService,
	}
}

func (asu *AgencyRatingUseCase) GetAgencyRating(agencyId string) (*Domain.AgencyRating, int, error) {
	agencyStatistics, err := asu.AgencyRatingRepo.GetAgencyRating(agencyId) 
	if err != nil {
		statusCode, err := asu.ErrorService.InternalServer()
		return nil, statusCode, err
	}

	statusCode, err := asu.ErrorService.NoError()
	return agencyStatistics, statusCode, err
}
