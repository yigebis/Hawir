package UseCase

import (
	"Hawir/Domain"
)

type IAdminUseCase interface {
	Login(admin *Domain.Admin) (string, string, int, error)
	AddAgency(agency *Domain.Agency) (int, error)
	EditAgency(agency *Domain.Agency) (int, error)
	DeleteAgency(agencyID, adminEmail, password string) (int, error)
}

type IAdminRepo interface {
	GetAdminByEmail(email string) (*Domain.Admin, error)
}
