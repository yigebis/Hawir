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
