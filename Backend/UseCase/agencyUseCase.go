package UseCase

import (
	"Hawir/Domain"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AgencyUseCase struct {
	AgencyRepo      IAgencyRepository
	DriverRepo      IDriverRepository
	PasswordService IPasswordService
	TokenService    ITokenService
	ErrorService    IErrorService
	MailService     IMailService

	EmailExpiry     int64
	TokenExpiry     int64
	RefresherExpiry int64
}

func NewAgencyUseCase(agr IAgencyRepository, drr IDriverRepository, ps IPasswordService, ts ITokenService, es IErrorService, ms IMailService, ex, tx, rx int64) IAgencyUseCase {
	return &AgencyUseCase{
		AgencyRepo:      agr,
		DriverRepo:      drr,
		PasswordService: ps,
		TokenService:    ts,
		ErrorService:    es,
		MailService:     ms,
		EmailExpiry:     ex,
		TokenExpiry:     tx,
		RefresherExpiry: rx,
	}
}

func (aguc *AgencyUseCase) LoginAgencyAdmin(credentials *Domain.AgencyAdminCredentials) (string, string, int, error) {
	// check if the agency admin exists
	admin, err := aguc.AgencyRepo.GetAgencyAdmin(credentials.Email)
	if err != nil {
		code, err := aguc.ErrorService.InvalidEmailAgencyIDPassword()
		return "", "", code, err
	}

	// check compatibility of agency id
	if admin.AgencyID != credentials.AgencyID {
		code, err := aguc.ErrorService.InvalidEmailAgencyIDPassword()
		return "", "", code, err
	}

	// verify the password
	if aguc.PasswordService.VerifyPassword(admin.Password, credentials.Password) != nil {
		code, err := aguc.ErrorService.InvalidEmailAgencyIDPassword()
		return "", "", code, err
	}

	// create an access token
	accessToken, err := aguc.TokenService.GenerateAgencyToken(admin.Email, "agency", admin.AgencyID, admin.Role, aguc.TokenExpiry)
	if err != nil {
		code, err := aguc.ErrorService.InternalServer()
		return "", "", code, err
	}

	// create a refresher token
	refresherToken, err := aguc.TokenService.GenerateAgencyToken(admin.Email, "agency", admin.AgencyID, admin.Role, aguc.RefresherExpiry)
	if err != nil {
		code, err := aguc.ErrorService.InternalServer()
		return "", "", code, err
	}

	code, err := aguc.ErrorService.NoError()
	return accessToken, refresherToken, code, err
}

func (aguc *AgencyUseCase) ResetAgencyAdminPassword(passwordReset *Domain.PasswordReset) (int, error) {
	// check if the agency exists
	agency, err := aguc.AgencyRepo.GetAgencyByUniqueID((passwordReset.UniqueID))
	if err != nil {
		return aguc.ErrorService.InvalidEmailAgencyIDPassword()
	}
	// verify the password
	if aguc.PasswordService.VerifyPassword(agency.Password, passwordReset.OldPassword) != nil {
		return aguc.ErrorService.InvalidEmailAgencyIDPassword()
	}

	// hash the new password
	newHashedPassword, err := aguc.PasswordService.HashPassword(passwordReset.NewPassword)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	err = aguc.AgencyRepo.ResetAgencyAdminPassword(agency.UniqueID, newHashedPassword)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) GetAgency(id string) (*Domain.Agency, int, error) {
	agency, err := aguc.AgencyRepo.GetAgency(id)
	if err != nil {
		code, err := aguc.ErrorService.AgencyNotFound()
		return nil, code, err
	}

	code, err := aguc.ErrorService.NoError()
	return agency, code, err
}

func (aguc *AgencyUseCase) GetAgencyByUniqueID(id string) (*Domain.Agency, int, error) {
	agency, err := aguc.AgencyRepo.GetAgencyByUniqueID(id)
	if err != nil {
		code, err := aguc.ErrorService.AgencyNotFound()
		return nil, code, err
	}

	code, err := aguc.ErrorService.NoError()
	return agency, code, err
}

func (aguc *AgencyUseCase) GetAllAgencies() (*[]Domain.Agency, int, error) {
	agency, err := aguc.AgencyRepo.GetAllAgencies()
	if err != nil {
		code, err := aguc.ErrorService.AgencyNotFound()
		return nil, code, err
	}

	code, err := aguc.ErrorService.NoError()
	return agency, code, err
}

func (aguc *AgencyUseCase) AddBus(bus *Domain.Bus) (int, error) {
	// panic("unimplemented")
	// check if the bus with the same plate number exists
	_, err := aguc.AgencyRepo.GetBusByPlateNumber(bus.PlateNumber)

	if err == nil {
		// return aguc.ErrorService.BusAlreadyExists()
		return aguc.ErrorService.IncorrectPlateNo()
	}

	bus.IsReserved = false
	bus.RegistrationDate = time.Now()
	bus.CurrentTrips = []string{}

	err = aguc.AgencyRepo.AddBus(bus)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) EditBus(bus *Domain.Bus) (int, error) {
	err := aguc.AgencyRepo.EditBus(bus)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) DeleteBus(plateNumber string) (int, error) {
	err := aguc.AgencyRepo.DeleteBus(plateNumber)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) GetBusByPlateNumber(plateNumber string) (*Domain.Bus, int, error) {
	panic("unimplemented")
	bus, err := aguc.AgencyRepo.GetBusByPlateNumber(plateNumber)
	if err != nil {
		// code, err := aguc.ErrorService.BusNotFound()
		code, err := aguc.ErrorService.NoError()
		return nil, code, err
	}

	code, err := aguc.ErrorService.NoError()
	return bus, code, err
}

func (aguc *AgencyUseCase) GetAllBusesByAgencyID(agencyID primitive.ObjectID) (*[]Domain.Bus, int, error) {
	panic("unimplemented")
	buses, err := aguc.AgencyRepo.GetAllBusesByAgencyID(agencyID)
	if err != nil {
		// code, err := aguc.ErrorService.BusNotFound()
		code, err := aguc.ErrorService.NoError()
    return nil, code, err
  }
  
  code, err := aguc.ErrorService.NoError()
  return buses, code, err
}

func (aguc *AgencyUseCase) GetAgencyForUser(id string) (*Domain.AgencyDisplay, int, error) {
	agency, err := aguc.AgencyRepo.GetAgencyForUserById(id)
	if err != nil {
		code, err := aguc.ErrorService.AgencyNotFound()
		return nil, code, err
	}

	code, err := aguc.ErrorService.NoError()
  return agency, code, err
}

func (aguc *AgencyUseCase) AddDriver(driver *Domain.Driver) (int, error) {
	// check if the driver with the same email exists
	_, err := aguc.DriverRepo.GetDriverByEmail(driver.Email)
	if err == nil {
		return aguc.ErrorService.UserExists()
	}

	driver.RegistrationDate = time.Now()
	driver.CurrentTrips = []string{}
	driver.Verified = false

	// send email verification
	token, err := aguc.TokenService.GenerateEmailToken(driver.Email, aguc.EmailExpiry)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}
	aguc.MailService.SendVerificationEmail(driver.Email, token, "/driver")

	// hash the password
	hashedPassword, err := aguc.PasswordService.HashPassword(driver.Password)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}
	driver.Password = hashedPassword

	err = aguc.DriverRepo.AddDriver(driver)
	if err != nil {
		// fmt.Println("repo", err.Error())
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}
