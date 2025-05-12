package Router

import (
	"Hawir/Delivery/Controller"

	"github.com/gin-gonic/gin"
)

type BookingRouter struct {
	BookingController *Controller.BookingController
}

func NewBookingRouter(bc *Controller.BookingController) *BookingRouter {
	return &BookingRouter{
		BookingController: bc,
	}
}

func (br *BookingRouter) Run(router *gin.Engine) {
	//booking endpoints
	router.POST("/booking/seat/choose", br.BookingController.ChooseSeat)
	router.POST("/booking/add", br.BookingController.Book)
	router.PUT("/booking/edit/:id", br.BookingController.EditBook)
	router.DELETE("/booking/cancel", br.BookingController.CancelBook)
	router.GET("/booking/:id", br.BookingController.GetBooking)
	router.GET("/booking/all/:travelId", br.BookingController.GetAllBookings)
	router.GET("/booking/traveler/:travelerId", br.BookingController.GetBookingsForTraveler)
	router.GET("/booking/seats/:travelId", br.BookingController.GetTravelSeats)
}
