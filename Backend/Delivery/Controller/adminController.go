package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type AdminController struct {
	AdminUseCase UseCase.IAdminUseCase
	V            *validator.Validate
}

func NewAdminController(auc UseCase.IAdminUseCase) *AdminController {
	return &AdminController{
		AdminUseCase: auc,
		V:            validator.New(),
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

	code, err := admc.AdminUseCase.AddAgency(&agency)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "agency added successfully"})
}

func (admc *AdminController) EditAgency(ctx *gin.Context) {
	var agency = Domain.Agency{}

	err := ctx.ShouldBindJSON(&agency)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
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
