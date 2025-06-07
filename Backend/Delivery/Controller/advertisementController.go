package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type AdvertisementController struct {
	CLOUDINARY_API_KEY    string
	CLOUDINARY_API_SECRET string
	CLOUDINARY_CLOUD_NAME string
	AdvertisementUseCase  UseCase.IAdvertisementUseCase
	CloudinaryService     UseCase.ICloudService
	V                     *validator.Validate

	FOLDER_NAME string
}

func NewAdvertisementController(auc UseCase.IAdvertisementUseCase, apiKey, apiSecret, cloudName string, cs UseCase.ICloudService) *AdvertisementController {
	return &AdvertisementController{
		AdvertisementUseCase:  auc,
		CLOUDINARY_API_KEY:    apiKey,
		CLOUDINARY_API_SECRET: apiSecret,
		CLOUDINARY_CLOUD_NAME: cloudName,
		CloudinaryService:     cs,
		V:                     validator.New(),

		FOLDER_NAME: "advertisements",
	}
}

// func (adc *AdvertisementController) GetAdvertisementAPIKey(c *gin.Context) {
// 	timestamp := fmt.Sprintf("%d", time.Now().Unix())
// 	params := map[string]string{
// 		"timestamp": timestamp,
// 		"folder":    adc.FOLDER_NAME,
// 		// other optional params like public_id, eager, etc.
// 	}

// 	signature := adc.CloudinaryService.GenerateCloudinarySignature(params, adc.CLOUDINARY_API_SECRET)

// 	c.JSON(200, gin.H{
// 		"signature": signature,
// 		"timestamp": timestamp,
// 		"cloudName": adc.CLOUDINARY_CLOUD_NAME,
// 		"apiKey":    adc.CLOUDINARY_API_KEY,
// 		"folder":    adc.FOLDER_NAME,
// 	})
// }

func (adc *AdvertisementController) GetPublicID(c *gin.Context) {
	cloudName, uploadPreset := adc.CloudinaryService.GetAdvertisementPublicID()
	c.JSON(200, gin.H{
		"cloud_name":    cloudName,
		"upload_preset": uploadPreset,
	})
}

func (adc *AdvertisementController) AddAdvertisement(c *gin.Context) {
	// validate the struct
	var ad Domain.Advertisement
	if err := c.ShouldBindJSON(&ad); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	if err := adc.V.Struct(ad); err != nil {
		c.JSON(400, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// get the agency ID from the JWT token
	claims, exists := c.Get("agency")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	ad.AgencyID = mapClaims["agency_id"].(string)
	ad.CreatedAt = time.Now()

	statusCode, err := adc.AdvertisementUseCase.AddAdvertisement(&ad)
	if err != nil {
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(statusCode, gin.H{"message": "Advertisement added successfully"})
}

func (adc *AdvertisementController) GetAdvertisementByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "Advertisement ID is required"})
		return
	}

	ad, statusCode, err := adc.AdvertisementUseCase.GetAdvertisementByID(id)
	if err != nil {
		c.JSON(statusCode, gin.H{"error": "Advertisement not found"})
		return
	}

	c.JSON(200, ad)
}

func (adc *AdvertisementController) GetAllAdvertisements(c *gin.Context) {
	ads, statusCode, err := adc.AdvertisementUseCase.GetAllAdvertisements()
	if err != nil {
		c.JSON(statusCode, gin.H{"error": "Failed to retrieve advertisements"})
		return
	}

	c.JSON(200, ads)
}

func (adc *AdvertisementController) GetALlAgencyAdvertisements(c *gin.Context) {
	agencyID := c.Param("agencyID")
	if agencyID == "" {
		c.JSON(400, gin.H{"error": "Agency ID is required"})
		return
	}
	ads, statusCode, err := adc.AdvertisementUseCase.GetAllAgencyAdvertisements(agencyID)
	if err != nil {
		c.JSON(statusCode, gin.H{"error": "Failed to retrieve agency advertisements"})
		return
	}
	c.JSON(200, ads)
}

func (adc *AdvertisementController) DeleteAdvertisement(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "Advertisement ID is required"})
		return
	}

	// get the agency ID from the JWT token
	claims, exists := c.Get("agency")
	mapClaims := getClaims(claims, exists)
	if mapClaims == nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	agencyID := mapClaims["agency_id"].(string)
	statusCode, err := adc.AdvertisementUseCase.DeleteAdvertisement(id, agencyID)
	if err != nil {
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(statusCode, gin.H{"message": "Advertisement deleted successfully"})
}
