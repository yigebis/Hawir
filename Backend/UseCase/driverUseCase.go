package UseCase

import (
	"Hawir/Domain"
	"fmt"
)

type DriverUseCase struct {
	DriverRepo      IDriverRepository
	ErrorService    IErrorService
	PasswordService IPasswordService
	TokenService    ITokenService
	MailService     IMailService
	CloudService    ICloudService
	TokenExpiry     int64
	RefresherExpiry int64
}

func NewDriverUseCase(dr IDriverRepository, es IErrorService, ps IPasswordService, ts ITokenService, ms IMailService, cs ICloudService, tx, rx int64) IDriverUseCase {
	return &DriverUseCase{
		DriverRepo:      dr,
		ErrorService:    es,
		PasswordService: ps,
		MailService:     ms,
		TokenService:    ts,
		CloudService:    cs,
		TokenExpiry:     tx,
		RefresherExpiry: rx,
	}
}

func (duc *DriverUseCase) VerifyEmail(email, token string) (int, error) {
	// verify the token and the email
	claims, err := duc.TokenService.ValidateToken(token)
	if err != nil {
		return duc.ErrorService.InvalidToken()
	}

	if claims["email"] != email {
		return duc.ErrorService.InvalidToken()
	}

	err = duc.DriverRepo.VerifyEmail(email)
	if err != nil {
		return duc.ErrorService.UserNotFound()
	}

	return duc.ErrorService.NoError()
}

// RejectEmail rejects the email verification if the user decides not to verify the email
func (duc *DriverUseCase) RejectEmail(email, token string) (int, error) {
	// verify the token and the email
	claims, err := duc.TokenService.ValidateToken(token)
	if err != nil {
		// fmt.Println("Error in token validation:", err)
		return duc.ErrorService.InvalidToken()
	}

	// fmt.Println("claims")
	// fmt.Println(claims)
	if claims["email"] != email {
		return duc.ErrorService.InvalidToken()
	}

	// check if the user is already verified
	user, err := duc.DriverRepo.GetDriverByEmail(email)
	if err != nil {
		return duc.ErrorService.InternalServer()
	}

	if user.Verified {
		return duc.ErrorService.UserExists()
	}

	// delete the user from the database
	err = duc.DriverRepo.NullifyDriver(user.ID.Hex())
	if err != nil {
		return duc.ErrorService.InternalServer()
	}

	return duc.ErrorService.NoError()
}

func (du *DriverUseCase) LoginDriver(credentials *Domain.DriverCredentials) (*Domain.Driver, string, string, int, error) {
	// get the driver from the repository
	driver, err := du.DriverRepo.GetDriverByEmail(credentials.Email)
	if err != nil {
		code, err := du.ErrorService.InternalServer()
		return nil, "", "", code, err
	}

	//check if the driver is verified or not
	if !driver.Verified {
		code, err := du.ErrorService.NotVerified()
		return nil, "", "", code, err
	}

	// check if the password matches
	err = du.PasswordService.VerifyPassword(driver.Password, credentials.Password)
	if err != nil {
		fmt.Println("Error in password verification:", err)
		code, err := du.ErrorService.InvalidEmailPassword()
		return nil, "", "", code, err
	}

	// generate the token and refresher
	token, err := du.TokenService.GenerateToken(driver.ID.Hex(), driver.FirstName, "driver", du.TokenExpiry)
	if err != nil {
		code, err := du.ErrorService.InternalServer()
		return nil, "", "", code, err
	}

	refresher, err := du.TokenService.GenerateToken(driver.ID.Hex(), driver.FirstName, "driver", du.RefresherExpiry)
	if err != nil {
		code, err := du.ErrorService.InternalServer()
		return nil, "", "", code, err
	}

	// make the password field of driver off
	driver.Password = ""

	code, err := du.ErrorService.NoError()
	return driver, token, refresher, code, err
}

func (du *DriverUseCase) GetDriverByID(id string) (*Domain.Driver, int, error) {
	driver, err := du.DriverRepo.GetDriverByID(id)
	if err != nil {
		code, err := du.ErrorService.UserNotFound()
		return nil, code, err
	}

	if !driver.Verified {
		code, err := du.ErrorService.NotVerified()
		return nil, code, err
	}

	driver.Password = ""

	code, err := du.ErrorService.NoError()
	return driver, code, err
}

func (du *DriverUseCase) ChangePassword(id string, changePassword *Domain.DriverChangeCredentials) (int, error) {
	// verify the old password
	driver, err := du.DriverRepo.GetDriverByID(id)
	if err != nil {
		code, err := du.ErrorService.InternalServer()
		return code, err
	}

	if !driver.Verified {
		return du.ErrorService.NotVerified()
	}

	err = du.PasswordService.VerifyPassword(driver.Password, changePassword.OldPassword)
	if err != nil {
		code, err := du.ErrorService.InternalServer()
		return code, err
	}

	// hash the new password
	hashedPassword, err := du.PasswordService.HashPassword(changePassword.NewPassword)
	if err != nil {
		code, err := du.ErrorService.InternalServer()
		return code, err
	}

	// change the password in the repository
	driver.Password = hashedPassword

	err = du.DriverRepo.UpdateDriver(id, driver)
	if err != nil {
		code, err := du.ErrorService.InternalServer()
		return code, err
	}

	return du.ErrorService.NoError()
}

func (du *DriverUseCase) EditPhoto(id string, url string) (int, error) {
	driver, err := du.DriverRepo.GetDriverByID(id)
	if err != nil {
		code, err := du.ErrorService.UserNotFound()
		return code, err
	}

	// delete the old photo from cloudinary if the driver has one
	if driver.Photo != "" {
		err = du.CloudService.DeleteFromCloud(driver.Photo)
		if err != nil {
			fmt.Println("Error deleting old photo from cloudinary:", err)
		}
	}

	err = du.DriverRepo.EditPhoto(id, url)
	if err != nil {
		code, err := du.ErrorService.InternalServer()
		return code, err
	}

	return du.ErrorService.NoError()
}
