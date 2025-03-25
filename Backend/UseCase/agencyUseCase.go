package UseCase

import (
	"Hawir/Domain"
)

type AgencyUseCase struct {
	AgencyRepo      IAgencyRepository
	PasswordService IPasswordService
	TokenService    ITokenService
	ErrorService    IErrorService

	EmailExpiry     int64
	TokenExpiry     int64
	RefresherExpiry int64
}

func NewAgencyUseCase(agr IAgencyRepository, ps IPasswordService, ts ITokenService, es IErrorService, ex, tx, rx int64) IAgencyUseCase {
	return &AgencyUseCase{
		AgencyRepo:      agr,
		PasswordService: ps,
		TokenService:    ts,
		ErrorService:    es,
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
	accessToken, err := aguc.TokenService.GenerateAgencyToken(admin.Email, admin.Role, admin.AgencyID, aguc.TokenExpiry)
	if err != nil {
		code, err := aguc.ErrorService.InternalServer()
		return "", "", code, err
	}

	// create a refresher token
	refresherToken, err := aguc.TokenService.GenerateAgencyToken(admin.Email, admin.Role, admin.AgencyID, aguc.RefresherExpiry)
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

	// update the password
	agency.Password = newHashedPassword
	err = aguc.AgencyRepo.ResetAgencyAdminPassword(agency.ID, agency.Password)

	if err != nil {
		return aguc.ErrorService.InternalServer()
	}

	return aguc.ErrorService.NoError()
}

func (aguc *AgencyUseCase) GetAgencyByIdForUser(agencyId string) (*Domain.AgencyUser, int, error) {
	agency, err := aguc.AgencyRepo.GetAgencyByIdForUser(agencyId)
	if err != nil {
		statusCode, err := aguc.ErrorService.AgencyNotFound()
		return nil, statusCode, err
	}
	statusCode, err := aguc.ErrorService.NoError()
	return agency, statusCode, err
}
