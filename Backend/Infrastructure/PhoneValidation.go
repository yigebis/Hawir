package Infrastructure

import "unicode"

type ValidationService struct{}

func NewValidationService() *ValidationService {
	return &ValidationService{}
}

func (vs *ValidationService) PhoneValidation(phoneNumber string) bool {
	if len(phoneNumber) != 9 || (phoneNumber[0] != '7' && phoneNumber[0] != '9'){ // checks if the length is not equall to 9 or starts with either 7 or 9
		return false
	}

	for _, curr := range(phoneNumber) {
		if !unicode.IsDigit(curr){ // checks if the characters are all digits!
			return false
		}
	}

	return true
}
