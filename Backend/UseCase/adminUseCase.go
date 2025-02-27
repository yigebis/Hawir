package UseCase

import (
	"Hawir/Domain"
	"time"
)

type AdminUseCase struct {
	AdminRepo       IAgencyRepository
	PasswordService IPasswordService
	ErrorService    IErrorService
}

func NewAdminUseCase(repo IAgencyRepository, ps IPasswordService, es IErrorService) IAdminUseCase {
	return &AdminUseCase{
		AdminRepo:       repo,
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

	// hash the password of the agency
	hashedPassword, err := auc.PasswordService.HashPassword(agency.Password)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	agency.Password = hashedPassword

	// store the agency in database
	err = auc.AdminRepo.AddAgency(agency)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	return auc.ErrorService.NoError()
}

func (auc *AdminUseCase) EditAgency(agency *Domain.Agency) (int, error) {
	err := auc.AdminRepo.EditAgency(agency)
	if err != nil {
		return auc.ErrorService.InternalServer()
	}

	return auc.ErrorService.NoError()
}

func (auc *AdminUseCase) DeleteAgency(id string) (int, error) {
	err := auc.AdminRepo.DeleteAgency(id)

	if err != nil {
		return auc.ErrorService.AgencyNotFound()
	}

	return auc.ErrorService.NoError()
}

func (auc *AdminUseCase) GetAgency(id string) (*Domain.Agency, int, error) {
	agency, err := auc.AdminRepo.GetAgency(id)
	if err != nil {
		code, err := auc.ErrorService.AgencyNotFound()
		return nil, code, err
	}

	code, err := auc.ErrorService.NoError()
	return agency, code, err
}

func (auc *AdminUseCase) GetAllAgencies() (*[]Domain.Agency, int, error) {
	agency, err := auc.AdminRepo.GetAllAgencies()
	if err != nil {
		code, err := auc.ErrorService.AgencyNotFound()
		return nil, code, err
	}

	code, err := auc.ErrorService.NoError()
	return agency, code, err
}
