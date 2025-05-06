package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Router struct {
	UserController        *Controller.UserController
	AgencyController      *Controller.AgencyController
	TravelController      *Controller.TravelController
	AdminController       *Controller.AdminController
	BookingController     *Controller.BookingController
	DestinationController *Controller.DestinationController
	NotificationController *Controller.NotificationController
	JWTSigner             string
}

func NewRouter(uc *Controller.UserController, agc *Controller.AgencyController, tc *Controller.TravelController, ac *Controller.AdminController, bc *Controller.BookingController, destinationController *Controller.DestinationController, notificationController *Controller.NotificationController, jwtSigner string) *Router {
	return &Router{
		UserController:        uc,
		AgencyController:      agc,
		TravelController:      tc,
		AdminController:       ac,
		BookingController:     bc,
		DestinationController: destinationController,
		NotificationController: notificationController,
		JWTSigner:             jwtSigner,
	}
}

func (r *Router) Run() {
	router := gin.Default()

	// Apply CORS middleware before defining routes
	config := cors.Config{
		AllowOrigins:     []string{"*"}, // Frontend URL
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
	router.GET("/user/:id", r.UserController.GetUserById)
	router.POST("/user/:userId/fcm-token", r.UserController.StoreFCMTokenHandler)
	router.DELETE("/user/:userId/fcm-token", r.UserController.RemoveFCMTokenHandler)

	router.GET("/user/my/:id", Infrastructure.UserMiddleware(r.JWTSigner), r.UserController.MyProfile)             //user middleware
	router.PUT("/user/edit", Infrastructure.UserMiddleware(r.JWTSigner), r.UserController.EditUser)                //user middleware
	router.PUT("/user/password/reset", Infrastructure.UserMiddleware(r.JWTSigner), r.UserController.ResetPassword) //user middleware

	// agency endpoints
	router.POST("/agency/login", r.AgencyController.LoginAgencyAdmin)

	router.POST("/agency/password/reset", r.AgencyController.ResetAgencyAdminPassword)
	router.GET("/agency/:id", r.AgencyController.GetAgencyByUniqueID)
	router.GET("/agency/all", r.AgencyController.GetAllAgencies)
	router.GET("/agency/get/:id", r.AgencyController.GetAgencyForUser)
	// router.POST("/agency/edit", r.UserController.EditAgency)

	router.POST("/travel/add", r.TravelController.CreateTravel)                //agency authorization
	router.PUT("/travel/edit", r.TravelController.EditTravel)                  //agency authorization
	router.GET("/travel/:id", r.TravelController.ViewTravelById)               //no authorization
	router.GET("/travels/:agencyID", r.TravelController.ViewTravelsByAgencyId) //no authorization
	router.GET("/travels/search", r.TravelController.SearchTravel)             //no authorization
	router.DELETE("/travel/cancel/:id", r.TravelController.CancelTravel)       //agency authorization

	//admin-side endpoints
	router.POST("/agency/add", r.AdminController.AddAgency)
	router.DELETE("/agency/delete/:id", r.AdminController.DeleteAgency)
	router.PUT("/agency/edit/:id", r.AdminController.EditAgency)

	//booking endpoints
	router.POST("/booking/seat/choose", r.BookingController.ChooseSeat)
	router.POST("/booking/add", r.BookingController.Book)
	router.PUT("/booking/edit/:id", r.BookingController.EditBook)
	router.DELETE("/booking/cancel", r.BookingController.CancelBook)
	router.GET("/booking/:id", r.BookingController.GetBooking)
	router.GET("/booking/all/:travelId", r.BookingController.GetAllBookings)
	router.GET("/booking/traveler/:travelerId", r.BookingController.GetBookingsForTraveler)

	//destination endpoints
	router.POST("/destination/add", r.DestinationController.AddDestination)
	router.GET("/destination/:id", r.DestinationController.GetDestinationByID)
	router.PUT("/destination/edit", r.DestinationController.EditDestination)
	router.GET("/destination/all", r.DestinationController.ViewAllDestinations)

	//notification endpoints
	router.GET("/notification/:travellerId", r.NotificationController.GetNotificationsForTraveller)
	router.PUT("/notification/:travellerId/:notificationId/read", r.NotificationController.MarkNotificationAsRead)
	router.PUT("/notification/:travellerId/:notificationId/unread", r.NotificationController.MarkNotificationAsUnread)
	
	// router.Run()
	router.Run("0.0.0.0:8080")
}
