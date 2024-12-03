package Router

import (
	"Hawir/Delivery/Controller"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Router struct {
	UserController *Controller.UserController
	JWTSigner      string
}

func NewRouter(uc *Controller.UserController) *Router {
	return &Router{
		UserController: uc,
	}
}

func (r *Router) Run() {
	router := gin.Default()

	// Apply CORS middleware before defining routes
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},                   // Frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, // HTTP methods to allow
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"}, // Headers to allow
		ExposeHeaders:    []string{"Content-Length"},                          // Headers to expose to frontend
		AllowCredentials: true,                                                // Allow cookies or authentication headers
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

	router.Run()
}
