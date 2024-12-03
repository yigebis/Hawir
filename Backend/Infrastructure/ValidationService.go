package Infrastructure

import (
	"Hawir/UseCase"
	"unicode"
)

type ValidationService struct{
	ErrorService UseCase.IErrorService
}

func NewValidationService(es UseCase.IErrorService) *ValidationService {
	return &ValidationService{
		ErrorService: es,
	}
}

func (vs *ValidationService) PhoneValidation(phoneNumber string) (int, error) {
	if len(phoneNumber) != 9 || (phoneNumber[0] != '7' && phoneNumber[0] != '9'){ // checks if the length is not equall to 9 or starts with either 7 or 9
		return vs.ErrorService.InvalidPhoneNumber()
	}

	for _, curr := range(phoneNumber) {
		if !unicode.IsDigit(curr){ // checks if the characters are all digits!
			return vs.ErrorService.InvalidPhoneNumber()
		}
	}

	return vs.ErrorService.NoError()
}
