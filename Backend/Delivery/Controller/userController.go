package Controller

import (
	"Hawir/Domain"
	"Hawir/Infrastructure"
	"Hawir/UseCase"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserController struct {
	UserUseCase       UseCase.IUserUseCase
	AgencyUseCase     UseCase.IAgencyUseCase
	V                 *validator.Validate
	TokenService      UseCase.ITokenService
	OAuthService      *Infrastructure.OAuth
	PasswordService   UseCase.IPasswordService
	ValidationService *Infrastructure.ValidationService
	RefresherExpiry   int64
	WebsiteDomainName string
}

func NewUserController(u UseCase.IUserUseCase, auc UseCase.IAgencyUseCase, ts UseCase.ITokenService, oauthService *Infrastructure.OAuth, ps UseCase.IPasswordService, vs *Infrastructure.ValidationService, rx int64, wsn string) *UserController {
	return &UserController{
		UserUseCase:       u,
		AgencyUseCase:     auc,
		V:                 validator.New(),
		TokenService:      ts,
		OAuthService:      oauthService,
		PasswordService:   ps,
		ValidationService: vs,
		RefresherExpiry:   rx,
		WebsiteDomainName: wsn,
	}
}

func (uc *UserController) Register(ctx *gin.Context) {
	user := Domain.User{} // Creating a new user object that is empty

	err := ctx.ShouldBindJSON(&user)
	if err != nil {
		fmt.Println("binding")
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	// process other struct validation
	err = uc.V.Struct(user)
	if err != nil {
		fmt.Println("struct")
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	// validate the names
	if code, err := uc.ValidationService.NameValidation(user.FirstName); err != nil {
		fmt.Println("firstname")
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}
	if code, err := uc.ValidationService.NameValidation(user.LastName); err != nil {
		fmt.Println("lastname")
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	//validate password
	statusCode, err := uc.ValidationService.ValidatePassword(user.Password)
	if err != nil {
		fmt.Println("password")
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	//validate login preference
	// if user.LoginPreference == "email" && user.Email == "" {
	// 	ctx.JSON(400, gin.H{"error": "email is required"})
	// 	return
	// }

	// if user.LoginPreference == "phone_number" {
	// 	if user.PhoneNumber == "" {
	// 		ctx.JSON(400, gin.H{"error": "phone is required"})
	// 		return
	// 	}

	// 	statusCode, err = uc.ValidationService.PhoneValidation(user.PhoneNumber) // calls the phoneValidation method and gets the status code and err
	// 	if err != nil {
	// 		ctx.JSON(statusCode, gin.H{"error": err.Error()})
	// 		return
	// 	}
	// }

	if user.Email != "" && user.PhoneNumber != "" {
		ctx.JSON(400, gin.H{"error": "both email and phone number aren't allowed at registration time"})
		return
	}

	statusCode, err = uc.UserUseCase.Register(&user) // registers the data

	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "registration successful. Verification has been sent to the Email"})
}

func (uc *UserController) VerifyEmail(ctx *gin.Context) {
	email := ctx.Query("email")
	token := ctx.Query("token")

	code, err := uc.UserUseCase.VerifyEmail(email, token)

	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "email verified successfully"})
}

func (uc *UserController) RejectEmail(ctx *gin.Context) {
	email := ctx.Query("email")
	token := ctx.Query("token")

	code, err := uc.UserUseCase.RejectEmail(email, token)

	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "email verification rejected successfully"})
}

func (uc *UserController) LoginByEmail(ctx *gin.Context) {
	credential := Domain.EmailCredential{}
	err := ctx.ShouldBindJSON(&credential)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	//validate email and password existence
	uc.V.Struct(credential)

	var token, refresher string
	var code int

	if credential.Email != "" && credential.Password != "" {
		token, refresher, code, err = uc.UserUseCase.LoginByEmail(&credential)
	} else {
		ctx.JSON(code, gin.H{"error": "email and password are required"})
		return
	}

	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	// set the refresher on the http-only coockie
	ctx.SetCookie("refresher", refresher, int(uc.RefresherExpiry), "/", uc.WebsiteDomainName, false, true)

	ctx.JSON(code, gin.H{"token": token})
}

func (uc *UserController) LoginByPhoneNumber(ctx *gin.Context) {
	credential := Domain.PhoneCredential{}
	err := ctx.ShouldBindJSON(&credential)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	//validate phone number and password existence
	uc.V.Struct(credential)

	var token, refresher string
	var code int

	if credential.PhoneNumber != "" && credential.Password != "" {
		token, refresher, code, err = uc.UserUseCase.LoginByPhone(&credential)
	} else {
		ctx.JSON(code, gin.H{"error": "email and password are required"})
		return
	}

	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{
		"token":     token,
		"refresher": refresher,
	})
}

func (uc *UserController) LoginWithGoogle(ctx *gin.Context) {
	// Redirect to google login page
	url := uc.OAuthService.GetOAuthURL()
	ctx.Redirect(http.StatusTemporaryRedirect, url)
}

func (uc *UserController) GoogleCallback(ctx *gin.Context) {
	// in the callback, we get the code and state

	// Check if the state is the one we stored as statestring, preventing attacks
	state := ctx.Query("state")
	if state != uc.OAuthService.OAuthState {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid OAuth state"})
		return
	}

	// Get the code and check if it's empty
	code := ctx.Query("code")
	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "code not found"})
		return
	}

	// Exchange code for token, the token is different from our tokens, it's google's service token
	// we are requesting that token to access its oauth service
	token, err := uc.OAuthService.OAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to exchange token"})
		return
	}

	// Fetch user info
	client := uc.OAuthService.OAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user info"})
		return
	}

	defer resp.Body.Close()

	//changing the response body to a map
	var userInfo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode user info"})
		return
	}

	// transforming into Domain.User format
	var user = &Domain.User{}
	user.Email = userInfo["email"].(string)
	user.FirstName = userInfo["given_name"].(string)
	user.LastName = userInfo["family_name"].(string)

	accessToken, refresherToken, statusCode, err := uc.UserUseCase.LoginByAuth(user)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{
		"access_token":    accessToken,
		"refresher_token": refresherToken,
	})
}

func (uc *UserController) GetUserById(ctx *gin.Context) {
	id := ctx.Param("id")

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing user id"})
		return
	}

	user, statusCode, err := uc.UserUseCase.GetUserById(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, user)
}

func (uc *UserController) MyProfile(ctx *gin.Context) {
	id := ctx.Param("id")

	claims, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if claims.(jwt.MapClaims)["id"] != id {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing user id"})
		return
	}

	user, statusCode, err := uc.UserUseCase.MyProfile(id)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, user)
}

func (uc *UserController) EditUser(ctx *gin.Context) {
	user := Domain.UserProfile{}

	// err := ctx.Request.ParseMultipartForm(10 << 20) // 10 MB limit
	// if err != nil {
	// 	ctx.JSON(400, gin.H{"error": "unable to parse form"})
	// 	return
	// }

	// get the user id from the request context
	id := ctx.PostForm("id")
	if id == "" {
		fmt.Println("id")
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		fmt.Println("objID")
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	firstName := ctx.PostForm("first_name")
	lastName := ctx.PostForm("last_name")

	// validate the names
	if code, err := uc.ValidationService.NameValidation(user.FirstName); err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	if code, err := uc.ValidationService.NameValidation(user.LastName); err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	favouriteAgencies := ctx.PostFormArray("favourite_agencies")

	// validate the favourite agencies whether the agencies exist or not
	for _, agencyID := range favouriteAgencies {
		fmt.Println(agencyID)
		_, code, err := uc.AgencyUseCase.GetAgencyByUniqueID(agencyID)
		if err != nil {
			ctx.JSON(code, gin.H{"error": err.Error()})
			return
		}
	}

	user.ID = objID
	user.FirstName = firstName
	user.LastName = lastName
	user.FavouriteAgencies = favouriteAgencies

	fileHeader, err := ctx.FormFile("profile_photo")
	if err != nil && err != http.ErrMissingFile { // No file uploaded is okay
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "unable to parse file"})
		return
	}

	if fileHeader != nil {
		errMessage := checkPhotoFile(fileHeader)
		if errMessage != "" {
			ctx.JSON(400, gin.H{"error": errMessage})
			return
		}
	}
	// phone number validation

	statusCode, err := uc.UserUseCase.EditUser(&user, fileHeader)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "user edited successfully"})
}

func (uc *UserController) ResetPassword(ctx *gin.Context) {
	changeCredential := Domain.ChangeCredential{}
	// validate the credential struct
	err := ctx.ShouldBindJSON(&changeCredential)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	// validate the new passwords
	statusCode, err := uc.ValidationService.ValidatePassword(changeCredential.NewPassword)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	statusCode, err = uc.UserUseCase.ResetPassword(&changeCredential)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "password reset successfully"})
}
