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
	ForgotPassword(email string) (int, error)
	ChangePasswordWithCode(email, code, password string) (int, error)
}

type IUserRepository interface {
	CreateUser(user *Domain.User) (string, error)
	GetUserByEmail(email string) (*Domain.User, error)
	GetUserByPhoneNumber(phoneNumber string) (*Domain.User, error)
	VerifyUser(email string) error
	DeleteUserByEmail(email string) error
	GetUserById(id string) (*Domain.User, error)
	EditUser(user *Domain.UserProfile) error
	ChangePassword(id primitive.ObjectID, password string) error
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
	GenerateCode() (string, error)
}

type ICloudService interface {
	UploadProfileToCloud(fileHeader *multipart.FileHeader) (string, error)
	UploadEventMediaToCloud(fileHeader *multipart.FileHeader) (string, error)
	DeleteFromCloud(url string) error
	GenerateCloudinarySignature(params map[string]string, secret string) string
	GetAdvertisementPublicID() (string, string)
	GetTravelerPublicID() (string, string)
	GetDriverPublicID() (string, string)
	GetAgencyPublicID() (string, string)
	GetEventPublicID() (string, string)
	GetDestinationPublicID() (string, string)
}

type ICodeRepository interface {
	StoreCode(email, code string) error
	GetData(email string) (string, error)
	DeleteCode(email string) error
}
