package Controller

import (
	"Hawir/Domain"
	"Hawir/Infrastructure"
	"Hawir/UseCase"
	"fmt"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
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

func getAgencyClaims(claimsAny any, exists bool) jwt.MapClaims {
	if !exists {
		return nil
	}
	// claims := claimsAny.(map[string]interface{})
	return claimsAny.(jwt.MapClaims)
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

	claims := getAgencyClaims(ctx.Get("agency"))
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
	bus := Domain.Bus{}
	err := ctx.ShouldBindJSON(&bus)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = agc.V.Struct(bus)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid bus data"})
		return
	}

	code, err := agc.AgencyUseCase.EditBus(&bus)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "bus edited successfully"})
}

func (agc *AgencyController) DeleteBus(ctx *gin.Context) {
	plateNumber := ctx.Param("plate_number")

	code, err := agc.AgencyUseCase.DeleteBus(plateNumber)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "bus deleted successfully"})
}

func (agc *AgencyController) GetBusByPlateNumber(ctx *gin.Context) {
	plateNumber := ctx.Param("plate_number")

	bus, code, err := agc.AgencyUseCase.GetBusByPlateNumber(plateNumber)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, bus)
}

// func (agc *AgencyController) GetAllBusesByAgencyID(ctx *gin.Context) {
// 	// TODO: get the agencyID from the token

// 	// convert the agencyID to ObjectID
// 	agencyObjID, err := Infrastructure.ConvertToObjectID(agencyID)
// 	if err != nil {
// 		ctx.JSON(400, gin.H{"error": "invalid agency ID format"})
// 		return
// 	}

// 	buses, code, err := agc.AgencyUseCase.GetAllBusesByAgencyID(agencyObjID)
// 	if err != nil {
// 		ctx.JSON(code, gin.H{"error": err.Error()})
// 		return
// 	}

// 	ctx.JSON(code, buses)
// }

func (agc *AgencyController) AddDriver(ctx *gin.Context) {
	// panic("unimplemented")
	driver := Domain.Driver{}

	err := ctx.ShouldBindJSON(&driver)
	if err != nil {
		fmt.Println(err.Error())
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
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
	claims := getAgencyClaims(ctx.Get("agency"))
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

	code, err = agc.AgencyUseCase.AddDriver(&driver)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "driver added successfully"})
}
