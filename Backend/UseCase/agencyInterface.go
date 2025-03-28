package UseCase

import (
	"Hawir/Domain"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type IAgencyUseCase interface {
	LoginAgencyAdmin(credentials *Domain.AgencyAdminCredentials) (string, string, int, error)
	ResetAgencyAdminPassword(passwordReset *Domain.PasswordReset) (int, error)
	GetAllAgencies() (*[]Domain.Agency, int, error)
	GetAgency(id string) (*Domain.Agency, int, error)
	GetAgencyByUniqueID(id string) (*Domain.Agency, int, error)
}

type IAgencyRepository interface {
	AddAgency(agency *Domain.Agency) error
	EditAgency(agency *Domain.Agency) error
	DeleteAgency(agencyID string) error
	GetAgency(agencyID string) (*Domain.Agency, error)
	GetAllAgencies() (*[]Domain.Agency, error)
	CheckAgency(agencyID string) (bool, error)
	AddAgencyAdmin(admin *Domain.Admins) error
	EditAgencyAdmin(admin *Domain.Admins) error
	GetAgencyByUniqueID(uniqueID string) (*Domain.Agency, error)
	GetAgencyAdmin(email string) (*Domain.Admins, error)
	ResetAgencyAdminPassword(primitive.ObjectID, string) error
}
