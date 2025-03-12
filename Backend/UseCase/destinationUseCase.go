package UseCase

import "Hawir/Domain"

type DestinationUseCase struct {
	DestinationRepo IDestinationRepository
	ErrorService    IErrorService
}

func NewDestinationUseCase(destinationRepo IDestinationRepository, errorService IErrorService) IDestinationUseCase {
	return &DestinationUseCase{
		DestinationRepo: destinationRepo,
		ErrorService:    errorService,
	}
}

func (duc *DestinationUseCase) AddDestination(destination *Domain.Destination) (int, error) {
	err := duc.DestinationRepo.AddDestination(destination)
	if err != nil {
		return duc.ErrorService.InternalServer()
	}
	return duc.ErrorService.NoError()
}

// EditDestination implements IDestinationUseCase.
func (duc *DestinationUseCase) EditDestination(destination *Domain.Destination) (int, error) {
	err := duc.DestinationRepo.EditDestination(destination)
	if err != nil {
		return duc.ErrorService.DestinationNotFound()
	}

	return duc.ErrorService.NoError()
}

// ViewAllDestinations implements IDestinationUseCase.
func (duc *DestinationUseCase) ViewAllDestinations(limit, skip int) (*[]Domain.Destination, int, error) {
	destinations, total, err := duc.DestinationRepo.ViewAllDestinations(limit, skip)
	if err != nil {
		statusCode, errorMessage := duc.ErrorService.InternalServer()
		return nil, statusCode, errorMessage
	}

	// If no destinations exist, return a 404 error
	if total == 0 {
		statusCode, errorMessage := duc.ErrorService.DestinationNotFound()
		return nil, statusCode, errorMessage
	}

	statusCode, errorMessage := duc.ErrorService.NoError()

	return destinations, statusCode, errorMessage
}

// ViewDestinationById implements IDestinationUseCase.
func (duc *DestinationUseCase) ViewDestinationById(id string) (*Domain.Destination, int, error) {
	destination, err := duc.DestinationRepo.ViewDestinationById(id)
	
	if err != nil {
		statusCode, err := duc.ErrorService.DestinationNotFound()
		return nil, statusCode, err
	}

	statusCode, err := duc.ErrorService.NoError()
	return destination, statusCode, err
}
