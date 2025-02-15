package Controller

import (
	"Hawir/Domain"
	"Hawir/UseCase"

	"github.com/gin-gonic/gin"
)

type BookingController struct {
	BookingUseCase UseCase.IBookingUseCase
}

func NewBookingController(buc UseCase.IBookingUseCase) *BookingController {
	return &BookingController{
		BookingUseCase: buc,
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

}

func (bc *BookingController) CancelBook(ctx *gin.Context) {

}

func (bc *BookingController) GetBooking(ctx *gin.Context) {

}

func (bc *BookingController) GetAllBookings(ctx *gin.Context) {

}
