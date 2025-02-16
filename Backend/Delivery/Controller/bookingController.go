package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type BookingController struct {
	BookingUseCase UseCase.IBookingUseCase
	V *validator.Validate
}

func NewBookingController(buc UseCase.IBookingUseCase) *BookingController {
	return &BookingController{
		BookingUseCase: buc,
		V: validator.New(),
	}
}

func (bc *BookingController) Book(ctx *gin.Context) {
	var booking = Domain.Booking{}

	err := ctx.ShouldBindJSON(&booking)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	code, err := bc.BookingUseCase.Book(&booking)
	if err != nil {
		ctx.JSON(code, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(code, gin.H{"message": "seat booked successfully"})
}

func (bc *BookingController) ChooseSeat(ctx *gin.Context) {

}

func (bc *BookingController) ChangeSeat(ctx *gin.Context) {

}

func (bc *BookingController) EditBook(ctx *gin.Context) {
	booking := Domain.Booking{}

	err := ctx.ShouldBindJSON(&booking)
	if err != nil {
		ctx.JSON(400, gin.H{"error" : "invalid request payload"})
		return
	}

	err = bc.V.Struct(booking)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload", "details": err.Error()})
		return
	}

	statusCode, err := bc.BookingUseCase.EditBook(&booking)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "booking edited successfully"})
}

func (bc *BookingController) CancelBook(ctx *gin.Context) {
	bookingID := ctx.Param("id")
	if bookingID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error" : "missing Booking ID"})
		return
	}

	statusCode, err := bc.BookingUseCase.CancelBook(bookingID)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, nil)
}

func (bc *BookingController) GetBooking(ctx *gin.Context) {
	bookingId := ctx.Param("id")

	if bookingId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing booking ID"})
		return
	}

	booking, statusCode, err := bc.BookingUseCase.GetBooking(bookingId)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error" : err.Error()})
		return
	}

	ctx.JSON(statusCode, booking)
}

func (bc *BookingController) GetAllBookings(ctx *gin.Context) {

}
