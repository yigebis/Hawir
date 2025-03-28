package UseCase

import (
	"Hawir/Domain"
	"fmt"
	"strings"
	"time"
)

type AdminUseCase struct {
	AgencyRepo      IAgencyRepository
	PasswordService IPasswordService
	ErrorService    IErrorService
}

func NewAdminUseCase(repo IAgencyRepository, ps IPasswordService, es IErrorService) IAdminUseCase {
	return &AdminUseCase{
		AgencyRepo:      repo,
		PasswordService: ps,
		ErrorService:    es,
	}
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

func (auc *AdminUseCase) DeleteAgency(id string) (int, error) {
	err := auc.AgencyRepo.DeleteAgency(id)

	if err != nil {
		return auc.ErrorService.AgencyNotFound()
	}

	return auc.ErrorService.NoError()
}
