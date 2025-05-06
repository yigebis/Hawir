package UseCase

import (
	"Hawir/Domain"
	"mime/multipart"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type IUserUseCase interface {
	LoginByEmail(*Domain.EmailCredential) (string, string, int, error)
	LoginByPhone(*Domain.PhoneCredential) (string, string, int, error)
	LoginByAuth(*Domain.User) (string, string, int, error)
	Login(user *Domain.User, password string) (string, string, int, error)
	Register(user *Domain.User) (int, error)
	VerifyEmail(email, token string) (int, error)
	RejectEmail(email, token string) (int, error)
	GetUserById(id string) (*Domain.UserDisplay, int, error)
	MyProfile(id string) (*Domain.User, int, error)
	EditUser(user *Domain.UserProfile, fileHeader *multipart.FileHeader) (int, error)
	ResetPassword(credential *Domain.ChangeCredential) (int, error)
	StoreFCMToken(userID string, fcmToken string) error
	RemoveFCMToken(userID string, fcmToken string) error
	GetUserFCMTokens(userID string) ([]string, error)
}

type IUserRepository interface {
	CreateUser(user *Domain.User) error
	GetUserByEmail(email string) (*Domain.User, error)
	GetUserByPhoneNumber(phoneNumber string) (*Domain.User, error)
	VerifyUser(email string) error
	DeleteUserByEmail(email string) error
	GetUserById(id string) (*Domain.User, error)
	EditUser(user *Domain.UserProfile) error
	ChangePassword(id primitive.ObjectID, password string) error
	StoreUserFCMToken(userID string, fcmToken string) error
	RemoveUserFCMToken(userID string, fcmToken string) error
	GetUserFCMTokens(userID string) ([]string, error)
}

type IPasswordService interface {
	HashPassword(password string) (string, error)
	VerifyPassword(hashedPassword, plainPassword string) error
}

type ITokenService interface {
	GenerateToken(id, firstName, role string, expiryDuration int64) (string, error)
	GenerateEmailToken(email string, expiryDuration int64, role string) (string, error)
	GenerateAgencyToken(email, role, agencyID, admin_role string, expiryDuration int64) (string, error)
	ValidateToken(token string) (map[string]interface{}, error)
}

type ICloudService interface {
	UploadToCloudinary(fileHeader *multipart.FileHeader) (string, error)
}
