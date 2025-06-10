package UseCase

import (
	"Hawir/Domain"
	"mime/multipart"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

type AgencyUseCase struct {
	AgencyRepo      IAgencyRepository
	DriverRepo      IDriverRepository
	CodeRepo        ICodeRepository
	BusRepo         IBusRepository
	PasswordService IPasswordService
	TokenService    ITokenService
	ErrorService    IErrorService
	MailService     IMailService
	CloudService    ICloudService

	EmailExpiry     int64
	TokenExpiry     int64
	RefresherExpiry int64
}

func NewAgencyUseCase(agr IAgencyRepository, drr IDriverRepository, cr ICodeRepository, bus_r IBusRepository, ps IPasswordService, ts ITokenService, es IErrorService, ms IMailService, cs ICloudService, ex, tx, rx int64) IAgencyUseCase {
	return &AgencyUseCase{
		AgencyRepo:      agr,
		DriverRepo:      drr,
		CodeRepo:        cr,
		BusRepo:         bus_r,
		PasswordService: ps,
		TokenService:    ts,
		ErrorService:    es,
		MailService:     ms,
		CloudService:    cs,
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
	// Check if the bus with the same plate number exists
	_, err := aguc.BusRepo.GetBusByPlateNumber(bus.PlateNumber)

	if err == nil {
		// Bus with plate number already exists
		return aguc.ErrorService.IncorrectPlateNo()
	}

	// If error is something other than "not found", return internal error
	if err != mongo.ErrNoDocuments {
		return aguc.ErrorService.InternalServer()
	}

	// Bus doesn't exist, safe to add
	bus.IsReserved = false
	bus.RegistrationDate = time.Now()
	bus.CurrentTrips = []string{}

	err = aguc.BusRepo.AddBus(bus)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) EditBus(bus *Domain.Bus, agencyID string) (int, error) {
	// first get the bus info
	busInfo, err := aguc.BusRepo.GetBusByID(bus.ID.Hex())
	if err != nil {
		return aguc.ErrorService.BusNotFound()
	}

	if busInfo.AgencyID != agencyID {
		return aguc.ErrorService.NotAuthorized()
	}

	err = aguc.BusRepo.EditBus(bus)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) GetBusByID(id string) (*Domain.Bus, int, error) {
	bus, err := aguc.BusRepo.GetBusByID(id)
	if err != nil {
		// code, err := aguc.ErrorService.BusNotFound()
		code, err := aguc.ErrorService.NoError()
		return nil, code, err
	}

	code, err := aguc.ErrorService.NoError()
	return bus, code, err
}

func (aguc *AgencyUseCase) GetAllBusesByAgencyID(agencyID string) (*[]Domain.Bus, int, error) {
	buses, err := aguc.BusRepo.GetAllBusesByAgencyID(agencyID)
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

func (aguc *AgencyUseCase) AddDriver(driver *Domain.Driver, fileHeader *multipart.FileHeader) (int, error) {
	// check if the driver with the same email exists
	existingDriver, err := aguc.DriverRepo.GetDriverByEmail(driver.Email)
	if err == nil {
		if existingDriver.Verified {
			return aguc.ErrorService.UserExists()
		}
		driver = existingDriver
	}

	driver.RegistrationDate = time.Now()
	driver.CurrentTrips = []string{}
	driver.Verified = false

	var filePath string

	if fileHeader != nil {
		// upload to cloudinary
		url, err := aguc.CloudService.UploadProfileToCloud(fileHeader)
		if err != nil {
			return aguc.ErrorService.UnableToUploadFile()
		}
		filePath = url
	}
	driver.Photo = filePath

	// send email verification
	token, err := aguc.TokenService.GenerateEmailToken(driver.Email, aguc.EmailExpiry, "driver")
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

func (aguc *AgencyUseCase) EditDriver(driver *Domain.Driver, fileHeader *multipart.FileHeader) (int, error) {
	// first get the driver info
	driverInfo, err := aguc.DriverRepo.GetDriverByID(driver.ID.Hex())
	if err != nil {
		return aguc.ErrorService.UserNotFound()
	}

	if driverInfo.AgencyID != driver.AgencyID {
		return aguc.ErrorService.NotAuthorized()
	}

	// we should decide on this, whether to allow the agency to edit the driver info even after the driver is verified
	// if so, we should not include this code. Otherwise, we should include it
	// if driverInfo.Verified {
	// 	return aguc.ErrorService.NotAuthorized()
	// }

	// hash the new password, no need to verify the old password
	if driver.Password != "" {
		hashedPassword, err := aguc.PasswordService.HashPassword(driver.Password)
		if err != nil {
			return aguc.ErrorService.InternalServer()
		}
		driver.Password = hashedPassword
	} else {
		driver.Password = driverInfo.Password
	}

	var filePath string

	if fileHeader != nil {
		// upload to cloudinary
		url, err := aguc.CloudService.UploadProfileToCloud(fileHeader)
		if err != nil {
			return aguc.ErrorService.UnableToUploadFile()
		}
		filePath = url
		driver.Photo = filePath
	}

	err = aguc.DriverRepo.UpdateDriver(driver.ID.Hex(), driver)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) DeleteDriver(id, agencyID string) (int, error) {
	// retrievt the driver info
	driverInfo, err := aguc.DriverRepo.GetDriverByID(id)
	if err != nil {
		return aguc.ErrorService.UserNotFound()
	}

	if driverInfo.AgencyID != agencyID {
		return aguc.ErrorService.NotAuthorized()
	}

	// edit the driver info in the database
	err = aguc.DriverRepo.NullifyDriver(id)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) GetAllDriversByAgencyID(agencyID string) (*[]Domain.Driver, int, error) {
	drivers, err := aguc.DriverRepo.GetAllDriversByAgencyID(agencyID)
	if err != nil {
		code, err := aguc.ErrorService.UserNotFound()
		return nil, code, err
	}

	code, err := aguc.ErrorService.NoError()
	return drivers, code, err
}

func (aguc *AgencyUseCase) ForgotPassword(email string) (int, error) {
	// check if the agency admin exists
	_, err := aguc.AgencyRepo.GetAgencyAdmin(email)
	if err != nil {
		return aguc.ErrorService.UserNotFound()
	}

	// generate a code
	code, err := aguc.TokenService.GenerateCode()
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	// store the code in the database by hashing it
	hashedCode, err := aguc.PasswordService.HashPassword(code)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	err = aguc.CodeRepo.StoreCode(email, hashedCode)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	// send the code to the user's email
	err = aguc.MailService.SendPasswordResetEmail(email, code)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) ChangePasswordWithCode(email, code, password string) (int, error) {
	// check if the agency admin exists
	_, err := aguc.AgencyRepo.GetAgencyAdmin(email)
	if err != nil {
		return aguc.ErrorService.InvalidEmailPassword()
	}

	// check if the code is correct
	hashedCode, err := aguc.CodeRepo.GetData(email)
	if err != nil {
		return aguc.ErrorService.InvalidEmailPassword()
	}

	// check if the code is correct
	if aguc.PasswordService.VerifyPassword(hashedCode, code) != nil {
		return aguc.ErrorService.InvalidEmailPassword()
	}

	// hash the new password
	hashedPassword, err := aguc.PasswordService.HashPassword(password)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	// change the password
	if err = aguc.AgencyRepo.ResetAgencyAdminPassword(email, hashedPassword); err != nil {
		return aguc.ErrorService.InternalServer()
	}

	// delete the code data from database
	err = aguc.CodeRepo.DeleteCode(email)
	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}
