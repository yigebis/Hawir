package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type UserController struct {
	UserUseCase  UseCase.IUserUseCase
	V            *validator.Validate
	TokenService UseCase.ITokenService
}

func NewUserController(u UseCase.IUserUseCase, ts UseCase.ITokenService) *UserController {
	return &UserController{
		UserUseCase:  u,
		V:            validator.New(),
		TokenService: ts,
	}
}

func (uc *UserController) Register(ctx *gin.Context) {
	user := Domain.User{}

	err := ctx.ShouldBindJSON(&user)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	// process other struct validation
	err = uc.V.Struct(user)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	//validate login preference
	if user.LoginPreference == "email" && user.Email == "" {
		ctx.JSON(400, gin.H{"error": "email is required"})
		return
	}

	if user.LoginPreference == "phone_number" && user.PhoneNumber == "" {
		ctx.JSON(400, gin.H{"error": "phone is required"})
		return
	}

	if user.Email != "" && user.PhoneNumber != "" {
		ctx.JSON(400, gin.H{"error": "both email and phone number aren't allowed at registration time"})
		return
	}
	code, err := uc.UserUseCase.Register(&user)

	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "registration successful. Verification has been sent to the Email"})
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

func (c *UserController) LoginByEmail(ctx *gin.Context) {
	credential := Domain.EmailCredential{}
	err := ctx.ShouldBindJSON(&credential)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	var token, refresher string
	var code int

	if credential.Email != "" && credential.Password != "" {
		token, refresher, code, err = c.UserUseCase.LoginByEmail(&credential)
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

func (uc *UserController) LoginByPhoneNumber(ctx *gin.Context) {
	panic("unimplemented")
}
