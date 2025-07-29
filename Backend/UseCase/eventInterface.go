package UseCase

import (
	"Hawir/Domain"
)

type IEventUseCase interface {
	AddEvent(event *Domain.Event) (int, error)
	GetEventByID(id string) (*Domain.Event, int, error)
	GetAllEvents(skip, limit int, eventFilter *Domain.EventFilter) (*[]Domain.Event, int, error)
	EditEvent(id string, event *Domain.Event) (int, error)
	DeleteEvent(id string) (int, error)
}

type IEventRepository interface {
	AddEvent(event *Domain.Event) error
	GetEventByID(id string) (*Domain.Event, error)
	GetAllEvents(skip, limit int, eventFilter *Domain.EventFilter) (*[]Domain.Event, error)
	EditEvent(id string, event *Domain.Event) error
	DeleteEvent(id string) error
}
