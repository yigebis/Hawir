package UseCase

import (
	"Hawir/Domain"
	"fmt"
	"mime/multipart"
	"time"
)

type UserUseCase struct {
	UserRepo        IUserRepository
	PasswordService IPasswordService
	TokenService    ITokenService
	MailService     IMailService
	ErrorService    IErrorService
	CloudService    ICloudService

	EmailExpiry     int64
	TokenExpiry     int64
	RefresherExpiry int64
}

func NewUserUseCase(ur IUserRepository, ps IPasswordService, ts ITokenService, ms IMailService, es IErrorService, cs ICloudService, ex, tx, rx int64) IUserUseCase {
	return &UserUseCase{
		UserRepo:        ur,
		PasswordService: ps,
		TokenService:    ts,
		MailService:     ms,
		ErrorService:    es,
		CloudService:    cs,
		EmailExpiry:     ex,
		TokenExpiry:     tx,
		RefresherExpiry: rx,
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

	// send verification email
	token, err := uuc.TokenService.GenerateEmailToken(user.Email, uuc.EmailExpiry, "user")
	if err != nil {
		fmt.Println("token_mail")
		return uuc.ErrorService.InternalServer()
	}

	err = uuc.MailService.SendVerificationEmail(user.Email, token, "/user")

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

	err = uuc.UserRepo.VerifyUser(email)

	if err != nil {
		return uuc.ErrorService.InternalServer()
	}

	return uuc.ErrorService.NoError()
}

// RejectEmail rejects the email verification if the user decides not to verify the email
func (uuc *UserUseCase) RejectEmail(email, token string) (int, error) {
	// verify the token and the email
	claims, err := uuc.TokenService.ValidateToken(token)
	if err != nil {
		return uuc.ErrorService.InvalidToken()
	}

	if claims["email"] != email {
		return uuc.ErrorService.InvalidToken()
	}

	// check if the user is already verified
	user, err := uuc.UserRepo.GetUserByEmail(email)
	if err != nil {
		return uuc.ErrorService.InternalServer()
	}

	if user.Verified {
		return uuc.ErrorService.UserExists()
	}

	// delete the user from the database
	err = uuc.UserRepo.DeleteUserByEmail(user.Email)
	if err != nil {
		return uuc.ErrorService.InternalServer()
	}

	return uuc.ErrorService.NoError()
}

/* returns token, refresh token, status code, and error */
func (uuc *UserUseCase) LoginByEmail(emailCredential *Domain.EmailCredential) (string, string, int, error) {
	user, err := uuc.UserRepo.GetUserByEmail(emailCredential.Email) // getting the user email credential from userRepo

	if err != nil { // if user doesnt exist
		statusCode, err := uuc.ErrorService.InvalidEmailPassword()
		return "", "", statusCode, err
	}

	return uuc.Login(user, emailCredential.Password)
}

/* returns token, refresh token, status code, and error */
func (uuc *UserUseCase) LoginByPhone(phoneCredential *Domain.PhoneCredential) (string, string, int, error) {
	user, err := uuc.UserRepo.GetUserByPhoneNumber(phoneCredential.PhoneNumber) // getting the user info from userRepo using phoneNumber

	if err != nil { // if user doesnt exist in userRepo
		statusCode, err := uuc.ErrorService.InvalidEmailPassword()
		return "", "", statusCode, err
	}

	return uuc.Login(user, phoneCredential.Password)
}

// helper function for avoiding redundant codes in LoginByPhone and LoginByEmail
func (uuc *UserUseCase) Login(user *Domain.User, password string) (string, string, int, error) {

	if !(user.Verified) { // if user is not verified
		statusCode, err := uuc.ErrorService.PendingVerification()
		return "", "", statusCode, err
	}

	if uuc.PasswordService.VerifyPassword(user.Password, password) != nil { // invalid password
		statusCode, err := uuc.ErrorService.InvalidEmailPassword()
		return "", "", statusCode, err
	}

	// creating an accessToken
	accessToken, err := uuc.TokenService.GenerateToken(user.ID.Hex(), user.FirstName, "user", uuc.TokenExpiry)

	if err != nil {
		statusCode, err := uuc.ErrorService.InternalServer()
		return "", "", statusCode, err
	}

	// creating a refreshToken
	refresherToken, err := uuc.TokenService.GenerateToken(user.ID.Hex(), user.FirstName, "user", uuc.RefresherExpiry)

	if err != nil {
		statusCode, err := uuc.ErrorService.InternalServer()
		return "", "", statusCode, err
	}

	code, err := uuc.ErrorService.NoError()
	return accessToken, refresherToken, code, err
}

func (uuc *UserUseCase) LoginByAuth(user *Domain.User) (string, string, int, error) {
	//check if the email exists
	_, err := uuc.UserRepo.GetUserByEmail(user.Email)

	//if the email does not exist, register the user
	if err != nil {
		//this can be the case that a user doesn't exist in the database so create the user

		//verify the user
		user.Verified = true

		//set the registration date
		user.RegistrationDate = time.Now()

		//store the user in the database
		createErr := uuc.UserRepo.CreateUser(user)
		if createErr != nil {
			code, err := uuc.ErrorService.InternalServer()
			return "", "", code, err
		}
	}

	//create an access token
	accessToken, err := uuc.TokenService.GenerateToken(user.ID.Hex(), user.FirstName, "user", uuc.TokenExpiry)
	if err != nil {
		code, err := uuc.ErrorService.InternalServer()
		return "", "", code, err
	}

	//create a refresher token
	refresherToken, err := uuc.TokenService.GenerateToken(user.ID.Hex(), user.FirstName, "user", uuc.RefresherExpiry)
	if err != nil {
		code, err := uuc.ErrorService.InternalServer()
		return "", "", code, err
	}

	code, err := uuc.ErrorService.NoError()
	return accessToken, refresherToken, code, err
}

func (uuc *UserUseCase) GetUserById(id string) (*Domain.UserDisplay, int, error) {
	user, err := uuc.UserRepo.GetUserById(id)
	userDisplay := &Domain.UserDisplay{
		ID:           user.ID,
		FirstName:    user.FirstName,
		LastName:     user.LastName,
		ProfilePhoto: user.ProfilePhoto,
	}

	if err != nil {
		code, err := uuc.ErrorService.InternalServer()
		return nil, code, err
	}

	code, err := uuc.ErrorService.NoError()
	return userDisplay, code, err
}

func (uuc *UserUseCase) MyProfile(id string) (*Domain.User, int, error) {
	user, err := uuc.UserRepo.GetUserById(id)
	if err != nil {
		code, err := uuc.ErrorService.UserNotFound()
		return nil, code, err
	}

	code, err := uuc.ErrorService.NoError()
	return user, code, err
}

func (uuc *UserUseCase) EditUser(user *Domain.UserProfile, fileHeader *multipart.FileHeader) (int, error) {
	var filePath string

	if fileHeader != nil {
		// upload to cloudinary
		url, err := uuc.CloudService.UploadToCloudinary(fileHeader)
		if err != nil {
			return uuc.ErrorService.UnableToUploadFile()
		}
		filePath = url

		// file, err := fileHeader.Open()
		// if err != nil {
		// 	code, err := uuc.ErrorService.UnableToOpenFile()
		// 	return code, err
		// }
		// defer file.Close()

		// ext := filepath.Ext(fileHeader.Filename)
		// fileName := uuid.New().String() + ext
		// localPath := filepath.Join("uploads", fileName)

		// out, err := os.Create(localPath)
		// if err != nil {
		// 	code, err := uuc.ErrorService.UnableToCreateFile()
		// 	return code, err
		// }
		// defer out.Close()

		// _, err = file.Seek(0, 0)
		// if err != nil {
		// 	code, err := uuc.ErrorService.UnableToSeekFile()
		// 	return code, err
		// }

		// _, err = out.ReadFrom(file)
		// if err != nil {
		// 	code, err := uuc.ErrorService.UnableToCopyFile()
		// 	return code, err
		// }

		// filePath = "/static/" + fileName
	}

	user.ProfilePhoto = filePath
	err := uuc.UserRepo.EditUser(user)
	if err != nil {
		return uuc.ErrorService.UserNotFound()
	}
	return uuc.ErrorService.NoError()
}

func (uuc *UserUseCase) ResetPassword(credential *Domain.ChangeCredential) (int, error) {
	// get the user from the database
	user, err := uuc.UserRepo.GetUserByEmail(credential.Email)
	if err != nil {
		return uuc.ErrorService.InvalidEmailPassword()
	}

	// check if the user is verified
	if !user.Verified {
		return uuc.ErrorService.PendingVerification()
	}

	// check if the old password is empty and user's password is also empty
	var empty1, empty2 = 0, 0
	if user.Password == "" {
		empty1 = 1
	}
	if credential.OldPassword == "" {
		empty2 = 1
	}
	if empty1^empty2 == 1 {
		return uuc.ErrorService.InvalidEmailPassword()
	}

	// check if the old password is correct
	if uuc.PasswordService.VerifyPassword(user.Password, credential.OldPassword) != nil {
		return uuc.ErrorService.InvalidEmailPassword()
	}

	// hash the new password
	hashedPassword, err := uuc.PasswordService.HashPassword(credential.NewPassword)
	if err != nil {
		return uuc.ErrorService.InternalServer()
	}

	err = uuc.UserRepo.ChangePassword(user.ID, hashedPassword)
	if err != nil {
		return uuc.ErrorService.InternalServer()
	}

	return uuc.ErrorService.NoError()
}
