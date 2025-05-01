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
	// check if a destination with the same name already exists
	_, err := duc.DestinationRepo.GetDestinationByName(destination.Name)
	if err == nil {
		return duc.ErrorService.DestinationAlreadyExists()
	}

	id, err := duc.DestinationRepo.AddDestination(destination)
	if err != nil {
		return duc.ErrorService.InternalServer()
	}

	err = duc.DestinationRepo.InitializeDestinationDetails(id)
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

// ViewDestinationById implements IDestinationUseCase.
func (duc *DestinationUseCase) GetDestinationById(id string) (*Domain.Destination, int, error) {
	destination, err := duc.DestinationRepo.GetDestinationByID(id)

	if err != nil {
		statusCode, err := duc.ErrorService.DestinationNotFound()
		return nil, statusCode, err
	}

	statusCode, err := duc.ErrorService.NoError()
	return destination, statusCode, err
}

func (duc *DestinationUseCase) GetAllDestinations() (*[]Domain.Destination, int, error) {
	destinations, err := duc.DestinationRepo.GetAllDestinations()
	if err != nil {
		statusCode, err := duc.ErrorService.InternalServer()
		return nil, statusCode, err
	}

	statusCode, err := duc.ErrorService.NoError()
	return destinations, statusCode, err
}

func (duc *DestinationUseCase) DeleteDestination(id string) (int, error) {
	err := duc.DestinationRepo.DeleteDestination(id)
	if err != nil {
		statusCode, err := duc.ErrorService.InternalServer()
		return statusCode, err
	}

	return duc.ErrorService.NoError()
}

func (duc *DestinationUseCase) AddStations(destinationID string, stations *[]string) (int, error) {
	// bring the existing stations
	destination, err := duc.DestinationRepo.GetDestinationByID(destinationID)
	if err != nil {
		return duc.ErrorService.DestinationNotFound()
	}

	preStations := make(map[string]bool)
	for _, preStation := range destination.Stations {
		preStations[preStation] = true
	}

	for _, station := range *stations {
		preStations[station] = true
	}

	err = duc.DestinationRepo.UpdateStations(destinationID, &preStations)
	if err != nil {
		return duc.ErrorService.InternalServer()
	}

	return duc.ErrorService.NoError()
}

func (duc *DestinationUseCase) GetDestinationDetailsByID(id string) (*Domain.DestinationDetails, int, error) {
	detail, err := duc.DestinationRepo.GetDestinationDetailsByID(id)
	if err != nil {
		statusCode, err := duc.ErrorService.DestinationNotFound()
		return nil, statusCode, err
	}

	statusCode, err := duc.ErrorService.NoError()
	return detail, statusCode, err
}

func (duc *DestinationUseCase) EditDestinationDetails(destinationDetails *Domain.DestinationDetails) (int, error) {
	err := duc.DestinationRepo.EditDestinationDetails(destinationDetails)
	if err != nil {
		return duc.ErrorService.InternalServer()
	}

	return duc.ErrorService.NoError()
}

// ViewAllDestinations implements IDestinationUseCase.
// func (duc *DestinationUseCase) ViewAllDestinations(limit, skip int) (*[]Domain.Destination, int, error) {
// destinations, total, err := duc.DestinationRepo.ViewAllDestinations(limit, skip)
// if err != nil {
// 	statusCode, errorMessage := duc.ErrorService.InternalServer()
// 	return nil, statusCode, errorMessage
// }

// // If no destinations exist, return a 404 error
// if total == 0 {
// 	statusCode, errorMessage := duc.ErrorService.DestinationNotFound()
// 	return nil, statusCode, errorMessage
// }

// statusCode, errorMessage := duc.ErrorService.NoError()

// return destinations, statusCode, errorMessage
// }
