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
func (duc *DestinationUseCase) ViewAllDestinations() (*[]Domain.Destination, int, error) {
	panic("unimplemented")
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
