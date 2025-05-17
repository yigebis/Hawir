package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type UserRouter struct {
	UserController *Controller.UserController
}

func NewUserRouter(uc *Controller.UserController) *UserRouter {
	return &UserRouter{
		UserController: uc,
	}
}

func (ur *UserRouter) Run(router *gin.Engine, jwtSigner string) {
	// Define routes after middleware is applied
	router.POST("/api/register", ur.UserController.Register)
	router.POST("/api/login/email", ur.UserController.LoginByEmail)
	router.POST("/api/login/phone_number", ur.UserController.LoginByPhoneNumber)
	router.GET("/user/verify", ur.UserController.VerifyEmail)
	router.GET("/user/reject", ur.UserController.RejectEmail)
	router.GET("/auth/with/google", ur.UserController.LoginWithGoogle) // Redirects to Google login page
	router.GET("/auth/callback", ur.UserController.GoogleCallback)     // Handles Google callback
	router.GET("/user/:id", ur.UserController.GetUserById)
	router.POST("/user/:userId/fcm-token", Infrastructure.UserMiddleware(jwtSigner), ur.UserController.StoreFCMTokenHandler)
	router.DELETE("/user/:userId/fcm-token", Infrastructure.UserMiddleware(jwtSigner), ur.UserController.RemoveFCMTokenHandler)

	router.GET("/user/my/:id", Infrastructure.UserMiddleware(jwtSigner), ur.UserController.MyProfile)             //user middleware
	router.PUT("/user/edit", Infrastructure.UserMiddleware(jwtSigner), ur.UserController.EditUser)                //user middleware
	router.PUT("/user/password/reset", Infrastructure.UserMiddleware(jwtSigner), ur.UserController.ResetPassword) //user middleware

}
