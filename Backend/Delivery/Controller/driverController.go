package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"

	"Hawir/Infrastructure"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type DriverController struct {
	DriverUseCase     UseCase.IDriverUseCase
	V                 *validator.Validate
	ValidationService *Infrastructure.ValidationService
	RefresherExpiry   int64
	WebsiteDomainName string
}

func NewDriverController(du UseCase.IDriverUseCase, vs *Infrastructure.ValidationService, rx int64, wdn string) *DriverController {
	return &DriverController{
		DriverUseCase:     du,
		V:                 validator.New(),
		ValidationService: vs,
		RefresherExpiry:   rx,
		WebsiteDomainName: wdn,
	}
}

func (dc *DriverController) VerifyEmail(ctx *gin.Context) {
	token := ctx.Query("token")
	email := ctx.Query("email")
	// fmt.Println(token, email, "jhghj")
	code, err := dc.DriverUseCase.VerifyEmail(email, token)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "email verified successfully"})
}

func (dc *DriverController) RejectEmail(ctx *gin.Context) {
	token := ctx.Query("token")
	email := ctx.Query("email")

	code, err := dc.DriverUseCase.RejectEmail(email, token)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "email rejected successfully"})
}

func (dc *DriverController) LoginDriver(ctx *gin.Context) {
	credentials := Domain.DriverCredentials{}
	err := ctx.ShouldBindJSON(&credentials)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = dc.V.Struct(credentials)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := dc.ValidationService.ValidatePassword(credentials.Password)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "invalid email or agencyId or password"})
		return
	}

	driver, token, refresher, code, err := dc.DriverUseCase.LoginDriver(&credentials)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	// set the refresher on the http-only coockie
	ctx.SetCookie("refresher", refresher, int(dc.RefresherExpiry), "/", dc.WebsiteDomainName, false, true)

	ctx.JSON(code, gin.H{"token": token, "driver": driver})
}

func (dc *DriverController) GetDriverByID(ctx *gin.Context) {
	id := ctx.Param("id")
	driver, code, err := dc.DriverUseCase.GetDriverByID(id)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, driver)
}

func (dc *DriverController) ChangePassword(ctx *gin.Context) {
	claimsAny, exists := ctx.Get("driver")
	if !exists {
		ctx.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	claims, ok := claimsAny.(jwt.MapClaims)
	if !ok {
		ctx.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	id := claims["id"].(string)

	passwordChange := Domain.DriverChangeCredentials{}
	err := ctx.ShouldBindJSON(&passwordChange)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = dc.V.Struct(passwordChange)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := dc.ValidationService.ValidatePassword(passwordChange.NewPassword)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "invalid password"})
		return
	}

	if passwordChange.NewPassword != passwordChange.ConfirmPassword {
		ctx.JSON(400, gin.H{"error": "passwords do not match"})
		return
	}

	code, err = dc.DriverUseCase.ChangePassword(id, &passwordChange)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "password chaneged successfully"})
}
