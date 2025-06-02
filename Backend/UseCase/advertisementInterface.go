package UseCase

import (
	"Hawir/Domain"
)

type IAdvertisementUseCase interface {
	AddAdvertisement(ad *Domain.Advertisement) (int, error)
	GetAdvertisementByID(id string) (*Domain.Advertisement, int, error)
	GetAllAdvertisements() (*[]Domain.Advertisement, int, error)
	GetAllAgencyAdvertisements(agencyID string) (*[]Domain.Advertisement, int, error)
	DeleteAdvertisement(id string, agencyID string) (int, error)
}

type IAdvertisementRepository interface {
	AddAdvertisement(ad *Domain.Advertisement) error
	GetAdvertisementByID(id string) (*Domain.Advertisement, error)
	GetAllAdvertisements() (*[]Domain.Advertisement, error)
	GetAllAgencyAdvertisements(agencyID string) (*[]Domain.Advertisement, error)
	DeleteAdvertisement(id string, agencyID string) error
}
