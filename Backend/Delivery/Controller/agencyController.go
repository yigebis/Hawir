package Controller

import (
	"Hawir/Domain"
	"Hawir/Infrastructure"
	"Hawir/UseCase"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AgencyController struct {
	AgencyUseCase     UseCase.IAgencyUseCase
	V                 *validator.Validate
	TokenService      UseCase.ITokenService
	PasswordService   UseCase.IPasswordService
	ValidationService *Infrastructure.ValidationService
	RefresherExpiry   int64
	WebsiteDomainName string
}

func NewAgencyController(u UseCase.IAgencyUseCase, ts UseCase.ITokenService, ps UseCase.IPasswordService, vs *Infrastructure.ValidationService, rx int64, wsn string) *AgencyController {
	return &AgencyController{
		AgencyUseCase:     u,
		V:                 validator.New(),
		TokenService:      ts,
		PasswordService:   ps,
		ValidationService: vs,
		RefresherExpiry:   rx,
		WebsiteDomainName: wsn,
	}
}

// main functions

func (agc *AgencyController) LoginAgencyAdmin(ctx *gin.Context) {
	credentials := Domain.AgencyAdminCredentials{}
	err := ctx.ShouldBindJSON(&credentials)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := agc.ValidationService.ValidatePassword(credentials.Password)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "invalid email or agencyId or password"})
		return
	}

	token, refresher, code, err := agc.AgencyUseCase.LoginAgencyAdmin(&credentials)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	// set the refresher on the http-only coockie
	ctx.SetCookie("refresher", refresher, int(agc.RefresherExpiry), "/", agc.WebsiteDomainName, false, true)

	ctx.JSON(code, gin.H{"token": token})
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

func (agc *AgencyController) GetAgencyByUniqueID(ctx *gin.Context) {
	id := ctx.Param("id")

	agency, code, err := agc.AgencyUseCase.GetAgencyByUniqueID(id)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, agency)
}

func (agc *AgencyController) GetAllAgencies(ctx *gin.Context) {
	agencies, code, err := agc.AgencyUseCase.GetAllAgencies()
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, agencies)
}

func (agc *AgencyController) AddBus(ctx *gin.Context) {
	bus := Domain.Bus{}
	err := ctx.ShouldBindJSON(&bus)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	// claimsAny, exists := ctx.Get("agency")
	// fmt.Println(exists, claimsAny)

	claims := getClaims(ctx.Get("agency"))
	// fmt.Println(claims)
	if claims == nil {
		fmt.Println("claims is nil")
		ctx.JSON(400, gin.H{"error": "invalid token claims"})
		return
	}

	bus.AgencyID = claims["agency_id"].(string)

	err = agc.V.Struct(bus)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid bus data"})
		return
	}

	code, err := agc.AgencyUseCase.AddBus(&bus)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "bus added successfully"})
}

func (agc *AgencyController) EditBus(ctx *gin.Context) {
	id := ctx.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid bus ID"})
		return
	}

	bus := Domain.Bus{}
	err = ctx.ShouldBindJSON(&bus)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	bus.ID = objID

	err = agc.V.Struct(bus)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid bus data"})
		return
	}

	claimsAny, exists := ctx.Get("agency")
	claims := getClaims(claimsAny, exists)
	if claims == nil {
		ctx.JSON(400, gin.H{"error": "invalid token claims"})
		return
	}

	code, err := agc.AgencyUseCase.EditBus(&bus, claims["agency_id"].(string))
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "bus edited successfully"})
}

func (agc *AgencyController) GetBusByID(ctx *gin.Context) {
	id := ctx.Param("id")

	bus, code, err := agc.AgencyUseCase.GetBusByID(id)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, bus)
}

func (agc *AgencyController) GetAllBusesByAgencyID(ctx *gin.Context) {
	claimsAny, exists := ctx.Get("agency")
	claims := getClaims(claimsAny, exists)
	if claims == nil {
		ctx.JSON(400, gin.H{"error": "invalid token claims"})
		return
	}

	agencyID := claims["agency_id"].(string)

	buses, code, err := agc.AgencyUseCase.GetAllBusesByAgencyID(agencyID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, buses)
}

// driver management
func (agc *AgencyController) AddDriver(ctx *gin.Context) {
	driver := Domain.Driver{}

	driver.FirstName = ctx.PostForm("first_name")
	driver.LastName = ctx.PostForm("last_name")
	driver.Sex = ctx.PostForm("sex")
	dateOfBirthStr := ctx.PostForm("date_of_birth")
	dateOfBirth, err := time.Parse("2006-01-02", dateOfBirthStr) // Adjust format as needed
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid date format"})
		return
	}
	driver.DateOfBirth = dateOfBirth

	driver.Email = ctx.PostForm("email")
	driver.Phone = ctx.PostForm("phone")
	driver.Password = ctx.PostForm("password")

	fileHeader, err := ctx.FormFile("photo")
	if err != nil && err != http.ErrMissingFile {
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

	err = agc.V.Struct(driver)
	if err != nil {
		fmt.Println(err.Error())
		ctx.JSON(400, gin.H{"error": "invalid driver data"})
		return
	}

	if driver.Sex != "M" && driver.Sex != "F" {
		ctx.JSON(400, gin.H{"error": "invalid Sex data"})
		return
	}

	//validate the names
	code, err := agc.ValidationService.NameValidation(driver.FirstName + driver.LastName)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "invalid first name"})
		return
	}

	//assign the agency ID from the context claims
	claims := getClaims(ctx.Get("agency"))
	if claims == nil {
		ctx.JSON(400, gin.H{"error": "invalid token claims"})
		return
	}
	driver.AgencyID = claims["agency_id"].(string)

	//validate the password and phone numbers
	code, err = agc.ValidationService.ValidatePassword(driver.Password)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "invalid password"})
		return
	}

	code, err = agc.ValidationService.PhoneValidation(driver.Phone)
	if err != nil {
		ctx.JSON(code, gin.H{"error": "invalid phone number"})
		return
	}

	code, err = agc.AgencyUseCase.AddDriver(&driver, fileHeader)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "driver added successfully"})
}

func (agc *AgencyController) EditDriver(ctx *gin.Context) {
	id := ctx.PostForm("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid driver ID"})
		return
	}

	driver := Domain.Driver{}
	driver.ID = objID
	driver.FirstName = ctx.PostForm("first_name")
	driver.LastName = ctx.PostForm("last_name")
	driver.Sex = ctx.PostForm("sex")
	dateOfBirthStr := ctx.PostForm("date_of_birth")
	dateOfBirth, err := time.Parse("2006-01-02", dateOfBirthStr) // Adjust format as needed
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid date format"})
		return
	}
	driver.DateOfBirth = dateOfBirth

	// changing email is not allowed
	driver.Phone = ctx.PostForm("phone")
	driver.Password = ctx.PostForm("password")

	fileHeader, err := ctx.FormFile("photo")
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

	if driver.Sex != "" && driver.Sex != "M" && driver.Sex != "F" {
		ctx.JSON(400, gin.H{"error": "invalid Sex data"})
		return
	}

	//validate the names
	if driver.FirstName != "" {
		code, err := agc.ValidationService.NameValidation(driver.FirstName)
		if err != nil {
			ctx.JSON(code, gin.H{"error": "invalid first name"})
			return
		}
	}
	if driver.LastName != "" {
		code, err := agc.ValidationService.NameValidation(driver.LastName)
		if err != nil {
			ctx.JSON(code, gin.H{"error": "invalid first name"})
			return
		}
	}

	//assign the agency ID from the context claims
	claims := getClaims(ctx.Get("agency"))
	if claims == nil {
		ctx.JSON(400, gin.H{"error": "invalid token claims"})
		return
	}
	driver.AgencyID = claims["agency_id"].(string)

	//validate the password and phone numbers
	if driver.Password != "" {
		code, err := agc.ValidationService.ValidatePassword(driver.Password)
		if err != nil {
			ctx.JSON(code, gin.H{"error": "invalid password"})
			return
		}
	}

	if driver.Phone != "" {
		code, err := agc.ValidationService.PhoneValidation(driver.Phone)
		if err != nil {
			ctx.JSON(code, gin.H{"error": "invalid phone number"})
			return
		}
	}

	code, err := agc.AgencyUseCase.EditDriver(&driver, fileHeader)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "driver edited successfully"})
}

func (agc *AgencyController) DeleteDriver(ctx *gin.Context) {
	id := ctx.Param("id")

	// get the agency ID from the claims
	claimsAny, exists := ctx.Get("agency")
	claims := getClaims(claimsAny, exists)
	if claims == nil {
		ctx.JSON(400, gin.H{"error": "invalid token claims"})
		return
	}

	code, err := agc.AgencyUseCase.DeleteDriver(id, claims["agency_id"].(string))
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "driver deleted successfully"})
}

func (agc *AgencyController) GetAllDriversByAgencyID(ctx *gin.Context) {
	// get the agency ID from the claims
	claimsAny, exists := ctx.Get("agency")
	claims := getClaims(claimsAny, exists)
	if claims == nil {
		ctx.JSON(400, gin.H{"error": "invalid token claims"})
		return
	}

	agencyID := claims["agency_id"].(string)

	drivers, code, err := agc.AgencyUseCase.GetAllDriversByAgencyID(agencyID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, drivers)
}

func (agc *AgencyController) ForgetPassword(ctx *gin.Context) {
	email := ctx.Param("email")
	if email == "" {
		ctx.JSON(400, gin.H{"error": "missing email"})
		return
	}

	statusCode, err := agc.AgencyUseCase.ForgotPassword(email)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "short code has been sent to the email"})
}

func (agc *AgencyController) ChangePasswordWithForget(ctx *gin.Context) {
	credential := Domain.ForgetPassword{}
	if err := ctx.ShouldBindJSON(&credential); err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	// validate the new password
	statusCode, err := agc.ValidationService.ValidatePassword(credential.NewPassword)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	statusCode, err = agc.AgencyUseCase.ChangePasswordWithCode(credential.Email, credential.Code, credential.NewPassword)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "password changed successfully"})
}
