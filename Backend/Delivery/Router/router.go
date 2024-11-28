package Router

import (
	"Hawir/Delivery/Controller"

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

	router.POST("/register", r.UserController.Register)
	router.POST("/login/email", r.UserController.LoginByEmail)
	router.POST("/login/phone_number", r.UserController.LoginByPhoneNumber)
	router.GET("/verify", r.UserController.VerifyEmail)
	router.GET("/auth/with/google", r.UserController.LoginWithGoogle) //redirects to google login page
	router.GET("/auth/callback", r.UserController.GoogleCallback)     //user already agreed to give his info so google will redirect to this endpoint

	router.Run()
}
