package Infrastructure

import "unicode"

type ValidationService struct{}

func NewValidationService() *ValidationService {
	return &ValidationService{}
}

func (vs *ValidationService) PhoneValidation(phoneNumber string) bool {
	if len(phoneNumber) < 10 { // checks if the length is less than 10
		return false
	}

	for _, curr := range(phoneNumber) {
		if !unicode.IsDigit(curr){ // checks if the characters are all digits!
			return false
		}
	}

	return true
}
