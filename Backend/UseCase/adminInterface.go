package UseCase

import (
	"Hawir/Domain"
)

type IAdminUseCase interface {
	AddAgency(agency *Domain.Agency) (int, error)
	EditAgency(agency *Domain.Agency) (int, error)
	DeleteAgency(agencyID string) (int, error)
}
