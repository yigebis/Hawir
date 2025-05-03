package UseCase

import (
	"Hawir/Domain"
)

type IAdminUseCase interface {
	Login(admin *Domain.Admin) (string, string, int, error)
	AddAgency(agency *Domain.Agency) (int, error)
	EditAgency(agency *Domain.Agency) (int, error)
	DeleteAgency(agencyID, adminEmail, password string) (int, error)
	ChangeAdminPassword(adminEmail, oldPassword, newPassword, oldPassword2, newPassword2 string) (int, error)
}

type IAdminRepo interface {
	GetAdminByEmail(email string) (*Domain.Admin, error)
	ChangePassword(email, hashedPassword, hashedPassword2 string) error
}
