package Router

import (
	"Hawir/Delivery/Controller"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Router struct {
	UserController        *Controller.UserController
	TravelController      *Controller.TravelController
	AdminController       *Controller.AdminController
	BookingController     *Controller.BookingController
	DestinationController *Controller.DestinationController
	JWTSigner             string
}

func NewRouter(uc *Controller.UserController, tc *Controller.TravelController, ac *Controller.AdminController, bc *Controller.BookingController, dc *Controller.DestinationController, jwtSigner string) *Router {
	return &Router{
		UserController:        uc,
		TravelController:      tc,
		AdminController:       ac,
		BookingController:     bc,
		DestinationController: dc,
		JWTSigner:             jwtSigner,
	}
}

func (r *Router) Run() {
	router := gin.Default()

	// Apply CORS middleware before defining routes
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "https://hawir.netlify.app"}, // Frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},            // HTTP methods to allow
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},            // Headers to allow
		ExposeHeaders:    []string{"Content-Length"},                                     // Headers to expose to frontend
		AllowCredentials: true,                                                           // Allow cookies or authentication headers
	}
	router.Use(cors.New(config))

	// Define routes after middleware is applied
	router.POST("/api/register", r.UserController.Register)
	router.POST("/api/login/email", r.UserController.LoginByEmail)
	router.POST("/api/login/phone_number", r.UserController.LoginByPhoneNumber)
	router.GET("/verify", r.UserController.VerifyEmail)
	router.GET("/email/reject", r.UserController.RejectEmail)
	router.GET("/auth/with/google", r.UserController.LoginWithGoogle) // Redirects to Google login page
	router.GET("/auth/callback", r.UserController.GoogleCallback)     // Handles Google callback
	// router.GET("/api/travel/id/:id", r.TravelController.GetTravelByID)

	router.POST("/travel/add", r.TravelController.CreateTravel)                //agency authorization
	router.PUT("/travel/edit", r.TravelController.EditTravel)                  //agency authorization
	router.GET("/travel/:id", r.TravelController.ViewTravelById)               //no authorization
	router.GET("/travels/:agencyID", r.TravelController.ViewTravelsByAgencyId) //no authorization
	router.DELETE("/travel/cancel/:id", r.TravelController.CancelTravel)       //agency authorization

	//admin-side endpoints
	router.POST("/agency/add", r.AdminController.AddAgency)
	router.DELETE("/agency/delete/:id", r.AdminController.DeleteAgency)
	router.PUT("/agency/edit/:id", r.AdminController.EditAgency)
	router.GET("/agency/:id", r.AdminController.GetAgency)
	router.GET("/agency/all", r.AdminController.GetAllAgencies)

	//booking endpoints
	router.POST("/booking/seat/choose", r.BookingController.ChooseSeat)
	router.POST("/booking/add", r.BookingController.Book)
	router.PUT("/booking/edit/:id", r.BookingController.EditBook)
	router.DELETE("/booking/cancel", r.BookingController.CancelBook)
	router.GET("/booking/:id", r.BookingController.GetBooking)
	router.GET("/booking/all/:travelId", r.BookingController.GetAllBookings)

	//destination endpoints
	router.POST("/destination/add", r.DestinationController.AddDestination)
	router.GET("/destination/:id", r.DestinationController.GetDestinationByID)
	router.PUT("/destination/edit", r.DestinationController.EditDestination)
	router.GET("/destination/all", r.DestinationController.ViewAllDestinations)
	router.Run()
}
