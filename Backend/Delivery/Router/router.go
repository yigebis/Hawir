package Router

import (
	"Hawir/Delivery/Controller"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Router struct {
	UserController          *Controller.UserController
	AgencyController        *Controller.AgencyController
	TravelController        *Controller.TravelController
	AdminController         *Controller.AdminController
	BookingController       *Controller.BookingController
	DestinationController   *Controller.DestinationController
	DriverController        *Controller.DriverController
	EventController         *Controller.EventController
	BusTrackingController   *Controller.BusTrackingController
	AdvertisementController *Controller.AdvertisementController
	JWTSigner               string
}

func NewRouter(
	uc *Controller.UserController,
	agc *Controller.AgencyController,
	tc *Controller.TravelController,
	ac *Controller.AdminController,
	bc *Controller.BookingController,
	desc *Controller.DestinationController,
	dc *Controller.DriverController,
	ec *Controller.EventController,
	btc *Controller.BusTrackingController,
	adc *Controller.AdvertisementController,
	jwtSigner string,
) *Router {
	return &Router{
		UserController:          uc,
		AgencyController:        agc,
		TravelController:        tc,
		AdminController:         ac,
		BookingController:       bc,
		DestinationController:   desc,
		DriverController:        dc,
		EventController:         ec,
		BusTrackingController:   btc,
		AdvertisementController: adc,
		JWTSigner:               jwtSigner,
	}
}

func (r *Router) Run() {
	router := gin.Default()

	// Apply CORS middleware before defining routes
	config := cors.Config{
		// AllowOrigins:     []string{"http://localhost:5173", "https://hawir.netlify.app", "http://localhost:8081", "http://localhost:63966", "http://localhost:53939"}, // Frontend URL
		AllowOrigins:     []string{"*"},                                       // Allow all origins for development
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, // HTTP methods to allow
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"}, // Headers to allow
		ExposeHeaders:    []string{"Content-Length"},                          // Headers to expose to frontend
		AllowCredentials: true,                                                // Allow cookies or authentication headers
	}
	router.Use(cors.New(config))
	// router.Use(cors.Default())

	userRouter := NewUserRouter(r.UserController)
	agencyRouter := NewAgencyRouter(r.AgencyController)
	adminRouter := NewAdminRouter(r.AdminController)
	travelRouter := NewTravelRouter(r.TravelController)
	bookingRouter := NewBookingRouter(r.BookingController)
	destinationRouter := NewDestinationRouter(r.DestinationController)
	driverRouter := NewDriverRouter(r.DriverController)
	event_router := NewEventRouter(r.EventController)
	busTrackingRouter := NewBusTrackingRouter(r.BusTrackingController)
	advertisementRouter := NewAdvertisementRouter(r.AdvertisementController)

	userRouter.Run(router, r.JWTSigner)
	agencyRouter.Run(router, r.JWTSigner)
	adminRouter.Run(router, r.JWTSigner)
	travelRouter.Run(router, r.JWTSigner)
	bookingRouter.Run(router)
	destinationRouter.Run(router)
	driverRouter.Run(router, r.JWTSigner)
	event_router.Run(router, r.JWTSigner)
	busTrackingRouter.Run(router, r.JWTSigner)
	advertisementRouter.Run(router, r.JWTSigner)

	router.Run()
}
