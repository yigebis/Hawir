package UseCase

import (
	"Hawir/Domain"
)

type IDriverUseCase interface {
	VerifyEmail(email, token string) (int, error)
	RejectEmail(email, token string) (int, error)
	LoginDriver(credentials *Domain.DriverCredentials) (*Domain.Driver, string, string, int, error)
	GetDriverByID(id string) (*Domain.Driver, int, error)
	ChangePassword(id string, changePassword *Domain.DriverChangeCredentials) (int, error)
}

type IDriverRepository interface {
	VerifyEmail(email string) error
	AddDriver(driver *Domain.Driver) error
	GetDriverByID(id string) (*Domain.Driver, error)
	GetDriverByEmail(email string) (*Domain.Driver, error)
	GetAllDriversByAgencyID(agencyID string) (*[]Domain.Driver, error)
	UpdateDriver(id string, driver *Domain.Driver) error
	NullifyDriver(id string) error
	AssignTrip(driverID, tripID string) error
}
