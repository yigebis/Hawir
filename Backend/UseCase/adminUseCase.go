package UseCase

import (
	"Hawir/Domain"
	"fmt"
	"strings"
	"time"
)

type AdminUseCase struct {
	AdminRepo       IAdminRepo
	AgencyRepo      IAgencyRepository
	PasswordService IPasswordService
	ErrorService    IErrorService
	TokenService    ITokenService
	TokenExpiry     int64
	RefresherExpiry int64
}

func NewAdminUseCase(adminRepo IAdminRepo, agencyRepo IAgencyRepository, ps IPasswordService, es IErrorService, ts ITokenService, tx, rx int64) IAdminUseCase {
	return &AdminUseCase{
		AdminRepo:       adminRepo,
		AgencyRepo:      agencyRepo,
		PasswordService: ps,
		ErrorService:    es,
		TokenService:    ts,
		TokenExpiry:     tx,
		RefresherExpiry: rx,
	}
}

func (auc *AdminUseCase) Login(admin *Domain.Admin) (string, string, int, error) {
	// check if the admin exists in the database
	adminData, err := auc.AdminRepo.GetAdminByEmail(admin.Email)
	if err != nil {
		fmt.Println("Error fetching admin data:", err.Error())
		code, err := auc.ErrorService.InvalidEmailPassword()
		return "", "", code, err
	}

	// check if the first password is correct
	err = auc.PasswordService.VerifyPassword(adminData.Password, admin.Password)
	if err != nil {
		fmt.Println("Error verifying password:", err.Error())
		code, err := auc.ErrorService.InvalidEmailPassword()
		return "", "", code, err
	}

	// check if the second password is correct
	err = auc.PasswordService.VerifyPassword(adminData.Password2, admin.Password2)
	if err != nil {
		fmt.Println("Error verifying password2:", err.Error())
		code, err := auc.ErrorService.InvalidEmailPassword()
		return "", "", code, err
	}

	// generate a token for the admin
	token, err := auc.TokenService.GenerateEmailToken(adminData.Email, auc.TokenExpiry, "admin")
	if err != nil {
		code, err := auc.ErrorService.InternalServer()
		return "", "", code, err
	}

	// generate a refresher token for the admin
	refresher, err := auc.TokenService.GenerateEmailToken(adminData.Email, auc.RefresherExpiry, "admin")
	if err != nil {
		code, err := auc.ErrorService.InternalServer()
		return "", "", code, err
	}

	code, err := auc.ErrorService.NoError()
	return token, refresher, code, err
}

func (auc *AdminUseCase) AddAgency(agency *Domain.Agency) (int, error) {
	// set the default calendar and language
	agency.Calendar = "eth"
	agency.Language = "amh"

	// set the registration date of the agency as Now
	agency.RegistrationDate = time.Now()

	// generate a unique ID for the agency
	seconds := (time.Now().Unix()) % 50
	agency.UniqueID = strings.ToLower(strings.Split(agency.Name, " ")[0]) + fmt.Sprintf("%d", seconds)

	// hash the password of the agency
	hashedPassword, err := auc.PasswordService.HashPassword(agency.Password)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	agency.Password = hashedPassword

	// store the agency in database
	err = auc.AgencyRepo.AddAgency(agency)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	//store the admin in database
	admin := Domain.Admins{
		AgencyID: agency.UniqueID,
		Role:     "super",
		Email:    agency.SuperAdminEmail,
		Password: agency.Password,
	}

	err = auc.AgencyRepo.AddAgencyAdmin(&admin)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	return auc.ErrorService.NoError()
}

func (auc *AdminUseCase) EditAgency(agency *Domain.Agency) (int, error) {
	err := auc.AgencyRepo.EditAgency(agency)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	if agency.Password != "" {
		// hash the password
		hashedPassword, err := auc.PasswordService.HashPassword(agency.Password)
		if err != nil {
			return auc.ErrorService.InternalServer()
		}
		agency.Password = hashedPassword
	}

	admin := Domain.Admins{
		Email:    agency.SuperAdminEmail,
		Password: agency.Password,
	}

	err = auc.AgencyRepo.EditAgencyAdmin(&admin)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	return auc.ErrorService.NoError()
}

func (auc *AdminUseCase) DeleteAgency(id, adminEmail, password string) (int, error) {
	// check for the admin credentials
	admin, err := auc.AdminRepo.GetAdminByEmail(adminEmail)
	if err != nil {
		return auc.ErrorService.InvalidEmailPassword()
	}

	err = auc.PasswordService.VerifyPassword(admin.Password, password)
	if err != nil {
		return auc.ErrorService.InvalidEmailPassword()
	}

	err = auc.AgencyRepo.DeleteAgency(id)

	if err != nil {
		return auc.ErrorService.AgencyNotFound()
	}

	return auc.ErrorService.NoError()
}
