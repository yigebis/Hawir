package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type EventController struct {
	EventUseCase      UseCase.IEventUseCase
	V                 *validator.Validate
	MaxSizePerPage    int
	CloudinaryService UseCase.ICloudService
}

func NewEventController(euc UseCase.IEventUseCase, maxSizePerPage int, cloudinaryService UseCase.ICloudService) *EventController {
	return &EventController{
		EventUseCase:      euc,
		V:                 validator.New(),
		MaxSizePerPage:    maxSizePerPage,
		CloudinaryService: cloudinaryService,
	}
}

func (ec *EventController) GetUploadPreset(ctx *gin.Context) {
	cloudName, uploadPreset := ec.CloudinaryService.GetEventPublicID()
	ctx.JSON(200, gin.H{
		"cloud_name":    cloudName,
		"upload_preset": uploadPreset,
	})
}

func (ec *EventController) AddEvent(ctx *gin.Context) {
	title := ctx.PostForm("title")
	desc := ctx.PostForm("desc")
	destinationID := ctx.PostForm("destination_id")
	dateStr := ctx.PostForm("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid date format"})
		return
	}
	mediaLink := ctx.PostForm("media_link")

	// form, err := ctx.MultipartForm()
	// if err != nil {
	// 	ctx.JSON(400, gin.H{"error": "invalid multipart form"})
	// 	return
	// }
	// media := form.File["media"]

	// for _, fileHeader := range media {
	// 	errMessage := checkAnyFile(fileHeader)
	// 	if errMessage != "" {
	// 		ctx.JSON(400, gin.H{"error": errMessage})
	// 		return
	// 	}	}

	event := Domain.Event{
		Title:         title,
		Desc:          desc,
		DestinationID: destinationID,
		Date:          date,
		MediaLink:     mediaLink,
	}

	// fmt.Println("Event:", event)

	err = ec.V.Struct(&event)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	statusCode, err := ec.EventUseCase.AddEvent(&event)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "Event added successfully"})
}

func (ec *EventController) GetEventByID(ctx *gin.Context) {
	eventID := ctx.Param("id")
	if eventID == "" {
		ctx.JSON(400, gin.H{"error": "Event ID is required"})
		return
	}

	event, code, err := ec.EventUseCase.GetEventByID(eventID)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, event)
}

func (ec *EventController) GetAllEvents(ctx *gin.Context) {
	pageStr := ctx.Query("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid page number"})
		return
	}
	if page < 1 {
		ctx.JSON(400, gin.H{"error": "Page number must be greater than 0"})
		return
	}

	skip := (page - 1) * ec.MaxSizePerPage
	limit := ec.MaxSizePerPage

	// filter criteria
	title := ctx.Query("title")
	destinationID := ctx.Query("destination_id")
	dateMinStr := ctx.Query("date_min")
	dateMaxStr := ctx.Query("date_max")
	var dateMin, dateMax time.Time
	if dateMinStr != "" {
		dateMin, err = time.Parse("2006-01-02", dateMinStr)
		if err != nil {
			ctx.JSON(400, gin.H{"error": "Invalid date_min format"})
			return
		}
	}
	if dateMaxStr != "" {
		dateMax, err = time.Parse("2006-01-02", dateMaxStr)
		if err != nil {
			ctx.JSON(400, gin.H{"error": "Invalid date_max format"})
			return
		}
	}

	eventFilter := Domain.EventFilter{
		Title:         title,
		DestinationID: destinationID,
		DateMin:       dateMin,
		DateMax:       dateMax,
	}

	events, code, err := ec.EventUseCase.GetAllEvents(skip, limit, &eventFilter)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, events)
}

func (ec *EventController) EditEvent(ctx *gin.Context) {
	eventID := ctx.PostForm("id")
	if eventID == "" {
		ctx.JSON(400, gin.H{"error": "Event ID is required"})
		return
	}

	title := ctx.PostForm("title")
	desc := ctx.PostForm("desc")
	destinationID := ctx.PostForm("destination_id")
	dateStr := ctx.PostForm("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid date format"})
		return
	}
	mediaLink := ctx.PostForm("media_link")

	// form, err := ctx.MultipartForm()
	// if err != nil {
	// 	ctx.JSON(400, gin.H{"error": "invalid multipart form"})
	// 	return
	// }
	// media := form.File["media"]

	// for _, fileHeader := range media {
	// 	errMessage := checkAnyFile(fileHeader)
	// 	if errMessage != "" {
	// 		ctx.JSON(400, gin.H{"error": errMessage})
	// 		return
	// 	}
	// }

	event := Domain.Event{
		Title:         title,
		Desc:          desc,
		DestinationID: destinationID,
		Date:          date,
		MediaLink:     mediaLink,
	}

	err = ec.V.Struct(&event)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	statusCode, err := ec.EventUseCase.EditEvent(eventID, &event)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "Event edited successfully"})
}

func (ec *EventController) DeleteEvent(ctx *gin.Context) {
	eventID := ctx.Param("id")
	if eventID == "" {
		ctx.JSON(400, gin.H{"error": "Event ID is required"})
		return
	}

	statusCode, err := ec.EventUseCase.DeleteEvent(eventID)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "Event deleted successfully"})
}
