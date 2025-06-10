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
	V              *validator.Validate
}

func NewBookingController(buc UseCase.IBookingUseCase) *BookingController {
	return &BookingController{
		BookingUseCase: buc,
		V:              validator.New(),
	}
}

func (bc *BookingController) Book(ctx *gin.Context) {
	var booking = Domain.Booking{}

	err := ctx.ShouldBindJSON(&booking)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	createdBooking, statusCode, err := bc.BookingUseCase.Book(&booking)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, createdBooking)
}

func (bc *BookingController) ChooseSeat(ctx *gin.Context) {
	seat := Domain.Seat{}
	err := ctx.ShouldBindJSON(&seat)

	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = bc.V.Struct(seat)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	seat.SeatNo -= 1 // Adjusting seat number to be zero-based

	statusCode, err := bc.BookingUseCase.ChooseSeat(&seat)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, gin.H{"message": "seat chosen successfully"})
}

// func (bc *BookingController) ChangeSeat(ctx *gin.Context) {
// 	seat := Domain.Seat{}
// 	err := ctx.ShouldBindJSON(&seat)

// 	if err != nil {
// 		ctx.JSON(400, gin.H{"error": "invalid request payload"})
// 		return
// 	}

// 	err = bc.V.Struct(seat)
// 	if err != nil {
// 		ctx.JSON(400, gin.H{"error": "invalid request payload"})
// 		return
// 	}

// 	statusCode, err := bc.BookingUseCase.ChangeSeat(&seat)
// 	if err != nil {
// 		ctx.JSON(statusCode, gin.H{"error": err.Error()})
// 		return
// 	}

// 	ctx.JSON(statusCode, gin.H{"message": "seat changed successfully"})
// }

func (bc *BookingController) EditBook(ctx *gin.Context) {
	booking := Domain.Booking{}

	err := ctx.ShouldBindJSON(&booking)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
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
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing Booking ID"})
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
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, booking)
}

func (bc *BookingController) GetAllBookings(ctx *gin.Context) {
	travelID := ctx.Param("travelId")

	if travelID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing travel ID"})
		return
	}

	travelBookings, statusCode, err := bc.BookingUseCase.GetAllBookings(travelID)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, travelBookings)
}

func (bc *BookingController) GetBookingsForTraveler(ctx *gin.Context) {
	travelerID := ctx.Param("travelerId")

	if travelerID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing traveler ID"})
	}

	bookings, statusCode, err := bc.BookingUseCase.GetBookingsForTraveler(travelerID)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, bookings)
}

func (bc *BookingController) GetTravelSeats(ctx *gin.Context) {
	travelID := ctx.Param("travelId")

	if travelID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing travel ID"})
		return
	}

	travelSeats, statusCode, err := bc.BookingUseCase.GetTravelSeats(travelID)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, travelSeats)
}

func (bc *BookingController) UpdateBooking(ctx *gin.Context) {
	bookingStatus := Domain.BookingStatus{}

	err := ctx.ShouldBindJSON(&bookingStatus)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload"})
		return
	}

	err = bc.V.Struct(bookingStatus)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "invalid request payload", "details": err.Error()})
		return
	}

	booking, statusCode, err := bc.BookingUseCase.UpdateBooking(&bookingStatus)
	if err != nil {
		ctx.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(statusCode, booking)
}
