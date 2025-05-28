package UseCase

import (
	"Hawir/Domain"
	"mime/multipart"
	// "go.mongodb.org/mongo-driver/bson/primitive"
)

type IAgencyUseCase interface {
	LoginAgencyAdmin(credentials *Domain.AgencyAdminCredentials) (string, string, int, error)
	ResetAgencyAdminPassword(passwordReset *Domain.PasswordReset) (int, error)
	GetAllAgencies() (*[]Domain.Agency, int, error)
	GetAgency(id string) (*Domain.Agency, int, error)
	GetAgencyByUniqueID(id string) (*Domain.Agency, int, error)
  GetAgencyForUser(id string) (*Domain.AgencyDisplay, int, error)

	// vehicle management
	AddBus(bus *Domain.Bus) (int, error)
	EditBus(bus *Domain.Bus, agencyID string) (int, error)
	GetBusByID(id string) (*Domain.Bus, int, error)
	GetAllBusesByAgencyID(agencyID string) (*[]Domain.Bus, int, error)

	// driver management
	AddDriver(driver *Domain.Driver, fileHeader *multipart.FileHeader) (int, error)
	EditDriver(driver *Domain.Driver, fileHeader *multipart.FileHeader) (int, error)
	DeleteDriver(driverID, agencyID string) (int, error)
	GetAllDriversByAgencyID(agencyID string) (*[]Domain.Driver, int, error)

	// forget password
	ForgotPassword(email string) (int, error)
	ChangePasswordWithCode(email, code, password string) (int, error)
}

type IAgencyRepository interface {
	AddAgency(agency *Domain.Agency) error
	EditAgency(agency *Domain.Agency) error
	DeleteAgency(agencyID string) error
	GetAgency(agencyID string) (*Domain.Agency, error)
	GetAllAgencies() (*[]Domain.Agency, error)
	CheckAgencyByUniqueID(agencyID string) (bool, error)
	AddAgencyAdmin(admin *Domain.AgencyAdmin) error
	EditAgencyAdmin(admin *Domain.AgencyAdmin) error
	GetAgencyByUniqueID(uniqueID string) (*Domain.Agency, error)
	GetAgencyAdmin(email string) (*Domain.AgencyAdmin, error)
	GetAgencyForUserById(string) (*Domain.AgencyDisplay, error)
	ResetAgencyAdminPassword(email, password string) error

	// Vehicle management
	AddBus(bus *Domain.Bus) error
	EditBus(bus *Domain.Bus) error
	GetBusByID(id string) (*Domain.Bus, error)
	GetBusByPlateNumber(plateNumber string) (*Domain.Bus, error)
	GetAllBusesByAgencyID(agencyID string) (*[]Domain.Bus, error)
}
