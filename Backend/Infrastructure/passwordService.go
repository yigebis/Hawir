package Infrastructure

import (
	"Hawir/UseCase"

	"golang.org/x/crypto/bcrypt"
)

type PasswordService struct {
	ErrorService UseCase.IErrorService
}

func NewPasswordService(es UseCase.IErrorService) UseCase.IPasswordService {
	return &PasswordService{
		ErrorService: es,
	}
}

// HashPassword implements UseCase.IPasswordService.
func (p *PasswordService) HashPassword(password string) (string, error) {
	hashedPasswordSlice, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	hashedPassword := string(hashedPasswordSlice)
	return hashedPassword, nil
}

// VerifyPassword implements UseCase.IPasswordService.
func (p *PasswordService) VerifyPassword(hashedPassword string, plainPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
}

func (p *PasswordService) ValidatePassword(password string) (int, error) {
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
