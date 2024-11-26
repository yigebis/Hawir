package UseCase

import (
	"Hawir/Domain"
	"fmt"
	"strconv"
	"time"
)

type UserUseCase struct {
	UserRepo        IUserRepository
	PasswordService IPasswordService
	TokenService    ITokenService
	MailService     IMailService
	ErrorService    IErrorService

	EmailExpiry string
	TokenExpiry string
}

func NewUserUseCase(ur IUserRepository, ps IPasswordService, ts ITokenService, ms IMailService, es IErrorService, ex, tx string) IUserUseCase {
	return &UserUseCase{
		UserRepo:        ur,
		PasswordService: ps,
		TokenService:    ts,
		MailService:     ms,
		ErrorService:    es,
		EmailExpiry:     ex,
		TokenExpiry:     tx,
	}
}

func (uuc *UserUseCase) RegisterWithEmailPreference(user *Domain.User) {
	//check if the user with this email has already been registered
	_, err := uuc.UserRepo.GetUserByEmail(user.Email)
	if err != nil {

	}
}
func (uuc *UserUseCase) Register(user *Domain.User) (int, error) {
	// check if the user with this email has already been registered
	if user.Email != "" {
		existingUser, err := uuc.UserRepo.GetUserByEmail(user.Email)
		if err == nil {
			if !existingUser.Verified {
				return uuc.ErrorService.PendingVerification()
			}

			return uuc.ErrorService.UserExists()
		}
	} else if user.PhoneNumber != "" {
		// existingUser, err := uuc.UserRepo.GetUserByPhoneNumber(user.PhoneNumber)
		// if err == nil{
		// 	if !existingUser.Verified{
		// 		return uuc.ErrorService.PendingVerification()
		// 	}

		// 	return uuc.ErrorService.UserExists()
		// }
	}

	// Set verified field false
	user.Verified = false

	//hash the password
	hashedPassword, err := uuc.PasswordService.HashPassword(user.Password)
	if err != nil {
		fmt.Println("hashing")
		return uuc.ErrorService.InternalServer()
	}

	user.Password = hashedPassword
	user.RegistrationDate = time.Now()
	user.FavouriteAgencies = nil

	// store the user in the database
	err = uuc.UserRepo.CreateUser(user)
	if err != nil {
		fmt.Println("repo")
		return uuc.ErrorService.InternalServer()
	}

	//set the expiry time for accepting email verification
	seconds, _ := strconv.Atoi(uuc.EmailExpiry)
	expiryDuration := time.Now().Add(time.Second * time.Duration(seconds)).Unix()

	// send verification email
	token, err := uuc.TokenService.GenerateEmailToken(user.Email, expiryDuration)
	if err != nil {
		fmt.Println("token_mail")
		return uuc.ErrorService.InternalServer()
	}

	err = uuc.MailService.SendVerificationEmail(user.Email, token)

	if err != nil {
		fmt.Println("verification")
		return uuc.ErrorService.InternalServer()
	}

	return uuc.ErrorService.NoError()
}

func (uuc *UserUseCase) VerifyEmail(email, token string) (int, error) {
	// verify the token and the email
	claims, err := uuc.TokenService.ValidateToken(token)
	if err != nil {
		return uuc.ErrorService.InvalidToken()
	}

	if claims["email"] != email {
		return uuc.ErrorService.InvalidToken()
	}

	// check if the user is already verified
	fmt.Println(email, token)
	user, err := uuc.UserRepo.GetUserByEmail(email)
	if err != nil {
		return uuc.ErrorService.InternalServer()
	}

	if user.Verified {
		return uuc.ErrorService.UserExists()
	}

	user.Verified = true

	err = uuc.UserRepo.VerifyUser(user)

	if err != nil {
		return uuc.ErrorService.InternalServer()
	}

	return uuc.ErrorService.NoError()
}

func (uuc *UserUseCase) LoginByEmail(*Domain.EmailCredential) (string, string, int, error) {
	panic("unimplemented")
}
func (uuc *UserUseCase) LoginByPhone(*Domain.PhoneCredential) (string, string, int, error) {
	panic("unimplemented")
}
func (uuc *UserUseCase) Login(user *Domain.User, password string) (string, string, int, error) {
	panic("unimplemented")
}
