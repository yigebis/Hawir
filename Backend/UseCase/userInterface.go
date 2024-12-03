package UseCase

import (
	"Hawir/Domain"
)

type IUserUseCase interface {
	LoginByEmail(*Domain.EmailCredential) (string, string, int, error)
	LoginByPhone(*Domain.PhoneCredential) (string, string, int, error)
	LoginByAuth(*Domain.User) (string, string, int, error)
	Login(user *Domain.User, password string) (string, string, int, error)
	Register(user *Domain.User) (int, error)
	VerifyEmail(email, token string) (int, error)
	RejectEmail(email, token string) (int, error)
}

type IUserRepository interface {
	CreateUser(user *Domain.User) error
	GetUserByEmail(email string) (*Domain.User, error)
	GetUserByPhoneNumber(phoneNumber string) (*Domain.User, error)
	VerifyUser(user *Domain.User) error
	DeleteUserByEmail(email string) error
}

type IPasswordService interface {
	HashPassword(password string) (string, error)
	VerifyPassword(hashedPassword, plainPassword string) error
	ValidatePassword(password string) (int, error)
}

type ITokenService interface {
	GenerateToken(id, firstName string, expiryDuration int64) (string, error)
	GenerateEmailToken(email string, expiryDuration int64) (string, error)
	ValidateToken(token string) (map[string]interface{}, error)
}

type IMailService interface {
	SendVerificationEmail(to, token string) error
	SendPasswordResetEmail(to, resetToken string) error
}
