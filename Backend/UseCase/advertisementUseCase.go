package UseCase

import (
	"Hawir/Domain"
)

type AdvertisementUseCase struct {
	AdvertisementRepository IAdvertisementRepository
	ErrorService            IErrorService
}

func NewAdvertisementUseCase(adr IAdvertisementRepository, es IErrorService) IAdvertisementUseCase {
	return &AdvertisementUseCase{
		AdvertisementRepository: adr,
		ErrorService:            es,
	}
}

func (auc *AdvertisementUseCase) AddAdvertisement(ad *Domain.Advertisement) (int, error) {
	err := auc.AdvertisementRepository.AddAdvertisement(ad)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	return auc.ErrorService.NoError()
}

func (auc *AdvertisementUseCase) GetAdvertisementByID(id string) (*Domain.Advertisement, int, error) {
	ad, err := auc.AdvertisementRepository.GetAdvertisementByID(id)
	if err != nil {
		code, err := auc.ErrorService.InternalServer()
		return nil, code, err
	}

	code, err := auc.ErrorService.NoError()
	return ad, code, err
}

func (auc *AdvertisementUseCase) GetAllAdvertisements() (*[]Domain.Advertisement, int, error) {
	ads, err := auc.AdvertisementRepository.GetAllAdvertisements()
	if err != nil {
		code, err := auc.ErrorService.InternalServer()
		return nil, code, err
	}

	code, err := auc.ErrorService.NoError()
	return ads, code, err
}

func (auc *AdvertisementUseCase) GetAllAgencyAdvertisements(agencyID string) (*[]Domain.Advertisement, int, error) {
	ads, err := auc.AdvertisementRepository.GetAllAgencyAdvertisements(agencyID)
	if err != nil {
		code, err := auc.ErrorService.InternalServer()
		return nil, code, err
	}

	code, err := auc.ErrorService.NoError()
	return ads, code, err
}

func (auc *AdvertisementUseCase) DeleteAdvertisement(id string, agencyID string) (int, error) {
	err := auc.AdvertisementRepository.DeleteAdvertisement(id, agencyID)
	if err != nil {
		code, err := auc.ErrorService.InternalServer()
		return code, err
	}

	code, err := auc.ErrorService.NoError()
	return code, err
}
