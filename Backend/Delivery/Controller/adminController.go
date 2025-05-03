package Controller

import (
	"Hawir/Domain"
	"Hawir/Infrastructure"
	"Hawir/UseCase"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AdminController struct {
	AdminUseCase      UseCase.IAdminUseCase
	AgencyUseCase     UseCase.IAgencyUseCase
	V                 *validator.Validate
	passwordValidator *Infrastructure.ValidationService
	RefresherExpiry   int64
	WebsiteDomainName string
}

func NewAdminController(auc UseCase.IAdminUseCase, aguc UseCase.IAgencyUseCase, pv *Infrastructure.ValidationService, rx int64, wdn string) *AdminController {
	return &AdminController{
		AdminUseCase:      auc,
		AgencyUseCase:     aguc,
		V:                 validator.New(),
		passwordValidator: pv,
		RefresherExpiry:   rx,
		WebsiteDomainName: wdn,
	}
}

func (admc *AdminController) Login(ctx *gin.Context) {
	var admin = Domain.Admin{}

	err := ctx.ShouldBindJSON(&admin)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = admc.V.Struct(admin)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	// validate the admin credentials
	code, err := admc.passwordValidator.ValidatePassword(admin.Password)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	token, refresher, code, err := admc.AdminUseCase.Login(&admin)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"token": token})
	ctx.SetCookie("refresher", refresher, int(admc.RefresherExpiry), "/", admc.WebsiteDomainName, false, true)
}

func (admc *AdminController) AddAgency(ctx *gin.Context) {
	var agency = Domain.Agency{}

	err := ctx.ShouldBindJSON(&agency)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = admc.V.Struct(agency)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := admc.passwordValidator.ValidatePassword(agency.Password)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	code, err = admc.AdminUseCase.AddAgency(&agency)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "agency added successfully"})
}

func (admc *AdminController) EditAgency(ctx *gin.Context) {
	agencyID := ctx.Param("id")
	if agencyID == "" {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	var agency = Domain.Agency{}

	err := ctx.ShouldBindJSON(&agency)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	agency.ID, err = primitive.ObjectIDFromHex(agencyID)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	// validate the password if it's non-empty
	if agency.Password != "" {
		code, err := admc.passwordValidator.ValidatePassword(agency.Password)
		if err != nil {
			ctx.JSON(code, gin.H{"error": err.Error()})
			return
		}
	}

	code, err := admc.AdminUseCase.EditAgency(&agency)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "agency edited successfully"})
}

func (admc *AdminController) DeleteAgency(ctx *gin.Context) {
	id := ctx.Param("id")
	claimsAny, exists := ctx.Get("admin")
	if !exists {
		ctx.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	adminClaims, ok := claimsAny.(jwt.MapClaims)
	if !ok {
		ctx.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	adminEmail := adminClaims["email"].(string)

	var cred = struct {
		Password string
	}{}

	err := ctx.ShouldBindJSON(&cred)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := admc.passwordValidator.ValidatePassword(cred.Password)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	code, err = admc.AdminUseCase.DeleteAgency(id, adminEmail, cred.Password)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "agency deleted successfully"})
}

func (admc *AdminController) ChangeAdminPassword(ctx *gin.Context) {
	claimsAny, exists := ctx.Get("admin")
	if !exists {
		ctx.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	adminClaims, ok := claimsAny.(jwt.MapClaims)
	if !ok {
		ctx.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	adminEmail := adminClaims["email"].(string)

	var cred = struct {
		OldPassword  string `json:"old_password" validate:"required"`
		NewPassword  string `json:"new_password" validate:"required"`
		OldPassword2 string `json:"old_password2" validate:"required"`
		NewPassword2 string `json:"new_password2" validate:"required"`
	}{}

	err := ctx.ShouldBindJSON(&cred)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	for _, p := range []string{cred.OldPassword, cred.NewPassword, cred.OldPassword2, cred.NewPassword2} {
		statusCode, err := admc.passwordValidator.ValidatePassword(p)
		if err != nil {
			ctx.JSON(statusCode, gin.H{"error": err.Error()})
			return
		}
	}

	code, err := admc.AdminUseCase.ChangeAdminPassword(adminEmail, cred.OldPassword, cred.NewPassword, cred.OldPassword2, cred.NewPassword2)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "password changed successfully"})
}
