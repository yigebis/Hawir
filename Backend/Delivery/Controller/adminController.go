package Controller

import (
	"Hawir/Domain"
	"Hawir/Infrastructure"
	"Hawir/UseCase"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AdminController struct {
	AdminUseCase      UseCase.IAdminUseCase
	V                 *validator.Validate
	passwordValidator *Infrastructure.ValidationService
}

func NewAdminController(auc UseCase.IAdminUseCase, pv *Infrastructure.ValidationService) *AdminController {
	return &AdminController{
		AdminUseCase:      auc,
		V:                 validator.New(),
		passwordValidator: pv,
	}
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

	code, err := admc.AdminUseCase.DeleteAgency(id)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "agency deleted successfully"})
}

func (admc *AdminController) GetAgency(ctx *gin.Context) {
	id := ctx.Param("id")

	travel, code, err := admc.AdminUseCase.GetAgency(id)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, travel)
}

func (admc *AdminController) GetAllAgencies(ctx *gin.Context) {
	agencies, code, err := admc.AdminUseCase.GetAllAgencies()
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, agencies)
}
