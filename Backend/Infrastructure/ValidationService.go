package Infrastructure

import (
	"Hawir/UseCase"
	"unicode"
)

type ValidationService struct {
	ErrorService UseCase.IErrorService
}

func NewValidationService(es UseCase.IErrorService) *ValidationService {
	return &ValidationService{
		ErrorService: es,
	}
}

func (p *ValidationService) ValidatePassword(password string) (int, error) {
	if len(password) < 8 {
		return p.ErrorService.PasswordTooShort()
	}

	caps, lows, nums, special := 0, 0, 0, 0

	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			caps++
		case char >= 'a' && char <= 'z':
			lows++
		case char >= '0' && char <= '9':
			nums++
		default:
			special++
		}
	}

	if caps == 0 || lows == 0 || nums == 0 || special == 0 {
		return p.ErrorService.MissingValidPasswordChar()
	}

	return p.ErrorService.NoError()
}

func (vs *ValidationService) PhoneValidation(phoneNumber string) (int, error) {
	if len(phoneNumber) != 9 || (phoneNumber[0] != '7' && phoneNumber[0] != '9') { // checks if the length is not equall to 9 or starts with either 7 or 9
		return vs.ErrorService.InvalidPhoneNumber()
	}

	for _, curr := range phoneNumber {
		if !unicode.IsDigit(curr) { // checks if the characters are all digits!
			return vs.ErrorService.InvalidPhoneNumber()
		}
	}

	return vs.ErrorService.NoError()
}

func (vs *ValidationService) NameValidation(name string) (int, error) {
	for _, ch := range name {
		if !((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
			return vs.ErrorService.InvalidName()
		}
	}
	return vs.ErrorService.NoError()
}
