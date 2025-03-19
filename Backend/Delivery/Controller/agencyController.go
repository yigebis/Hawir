package Controller

import (
	"Hawir/Domain"
	"Hawir/Infrastructure"
	"Hawir/UseCase"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type AgencyController struct {
	AgencyUseCase     UseCase.IAgencyUseCase
	V                 *validator.Validate
	TokenService      UseCase.ITokenService
	PasswordService   UseCase.IPasswordService
	ValidationService *Infrastructure.ValidationService
}

func NewAgencyController(u UseCase.IAgencyUseCase, ts UseCase.ITokenService, ps UseCase.IPasswordService, vs *Infrastructure.ValidationService) *AgencyController {
	return &AgencyController{
		AgencyUseCase:     u,
		V:                 validator.New(),
		TokenService:      ts,
		PasswordService:   ps,
		ValidationService: vs,
	}
}

func (agc *AgencyController) LoginAgencyAdmin(ctx *gin.Context) {
	credentials := Domain.AgencyAdminCredentials{}
	err := ctx.ShouldBindJSON(&credentials)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := agc.ValidationService.ValidatePassword(credentials.Password)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "invalid password"})
		return
	}

	token, refresher, code, err := agc.AgencyUseCase.LoginAgencyAdmin(&credentials)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"token": token, "refresher": refresher})
}

func (agc *AgencyController) ResetAgencyAdminPassword(ctx *gin.Context) {
	passwordReset := Domain.PasswordReset{}

	err := ctx.ShouldBindJSON(&passwordReset)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := agc.ValidationService.ValidatePassword(passwordReset.NewPassword)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "invalid password"})
		return
	}

	code, err = agc.AgencyUseCase.ResetAgencyAdminPassword(&passwordReset)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "password reset successful"})
}
