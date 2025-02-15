package UseCase

import (
	"Hawir/Domain"
)

type IAdminUseCase interface {
	AddAgency(agency *Domain.Agency) (int, error)
	EditAgency(agency *Domain.Agency) (int, error)
	DeleteAgency(agencyID string) (int, error)
	GetAgency(agencyID string) (*Domain.Agency, int, error)
	GetAllAgencies() (*[]Domain.Agency, int, error)
}

type IAdminRepository interface {
	AddAgency(agency *Domain.Agency) error
	EditAgency(agency *Domain.Agency) error
	DeleteAgency(agencyID string) error
	GetAgency(agencyID string) (*Domain.Agency, error)
	GetAllAgencies() (*[]Domain.Agency, error)
}
