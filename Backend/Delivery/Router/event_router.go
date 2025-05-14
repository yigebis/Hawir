package Router

import (
	"Hawir/Delivery/Controller"
	"Hawir/Infrastructure"

	"github.com/gin-gonic/gin"
)

type EventRouter struct {
	EventController *Controller.EventController
}

func NewEventRouter(ec *Controller.EventController) *EventRouter {
	return &EventRouter{
		EventController: ec,
	}
}

func (er *EventRouter) Run(router *gin.Engine, jwt_string string) {
	// event endpoints
	router.POST("/event/add", Infrastructure.AdminMiddleware(jwt_string), er.EventController.AddEvent)
	router.PUT("/event/edit", Infrastructure.AdminMiddleware(jwt_string), er.EventController.EditEvent)
	router.DELETE("/event/delete/:id", Infrastructure.AdminMiddleware(jwt_string), er.EventController.DeleteEvent)
	router.GET("/event/:id", er.EventController.GetEventByID)
	router.GET("/event/all", er.EventController.GetAllEvents) // pagination here
	// router.GET("/event/search", er.EventController.SearchEvent) //pagination here
}
