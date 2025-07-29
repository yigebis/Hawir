package UseCase

import (
	"Hawir/Domain"
	"fmt"

	// "mime/multipart"
	"time"
)

type EventUseCase struct {
	EventRepository       IEventRepository
	DestinationRepository IDestinationRepository
	ErrorService          IErrorService
	CloudService          ICloudService
}

func NewEventUseCase(er IEventRepository, dr IDestinationRepository, es IErrorService, cs ICloudService) IEventUseCase {
	return &EventUseCase{
		EventRepository:       er,
		DestinationRepository: dr,
		ErrorService:          es,
		CloudService:          cs,
	}
}

func (euc *EventUseCase) AddEvent(event *Domain.Event) (int, error) {
	// check if the date is in the future
	if event.Date.Before(time.Now()) {
		return euc.ErrorService.InvalidEventDate()
	}

	// check if the destination exists
	_, err := euc.DestinationRepository.GetDestinationByID(event.DestinationID)
	if err != nil {
		code, err := euc.ErrorService.DestinationNotFound()
		return code, err
	}

	// upload the media files
	// for _, fileHeader := range *media {
	// 	url, err := euc.CloudService.UploadEventMediaToCloud(fileHeader)
	// 	if err != nil {
	// 		return euc.ErrorService.UnableToUploadFile()
	// 	}
	// 	event.MediaLinks = append(event.MediaLinks, url)
	// }

	err = euc.EventRepository.AddEvent(event)
	if err != nil {
		return euc.ErrorService.InternalServer()
	}

	return euc.ErrorService.NoError()
}

func (euc *EventUseCase) GetEventByID(id string) (*Domain.Event, int, error) {
	event, err := euc.EventRepository.GetEventByID(id)
	if err != nil {
		code, err := euc.ErrorService.EventNotFound()
		return nil, code, err
	}

	code, err := euc.ErrorService.NoError()
	return event, code, err
}

func (euc *EventUseCase) GetAllEvents(page, size int, eventFilter *Domain.EventFilter) (*[]Domain.Event, int, error) {
	events, err := euc.EventRepository.GetAllEvents(page, size, eventFilter)
	if err != nil {
		fmt.Println("Error getting events:", err)
		code, err := euc.ErrorService.InternalServer()
		return nil, code, err
	}

	code, err := euc.ErrorService.NoError()
	return events, code, err
}

func (euc *EventUseCase) EditEvent(id string, event *Domain.Event) (int, error) {
	// check if the date is in the future
	if event.Date.Before(time.Now()) {
		return euc.ErrorService.InvalidEventDate()
	}

	// upload the media files
	// for _, fileHeader := range *media {
	// 	url, err := euc.CloudService.UploadEventMediaToCloud(fileHeader)
	// 	if err != nil {
	// 		return euc.ErrorService.UnableToUploadFile()
	// 	}
	// 	event.MediaLinks = append(event.MediaLinks, url)
	// }

	// delete the old media file
	oldEvent, err := euc.EventRepository.GetEventByID(id)
	if err != nil {
		code, err := euc.ErrorService.EventNotFound()
		return code, err
	}

	err = euc.CloudService.DeleteFromCloud(oldEvent.MediaLink)
	if err != nil {
		fmt.Println("Error deleting old media files:", err)
	}

	err = euc.EventRepository.EditEvent(id, event)
	if err != nil {
		return euc.ErrorService.InternalServer()
	}

	return euc.ErrorService.NoError()
}

func (euc *EventUseCase) DeleteEvent(id string) (int, error) {
	event, err := euc.EventRepository.GetEventByID(id)
	if err != nil {
		code, err := euc.ErrorService.EventNotFound()
		return code, err
	}

	// delete the media files
	err = euc.CloudService.DeleteFromCloud(event.MediaLink)
	if err != nil {
		fmt.Println("Error deleting media files:", err)
	}
	// for _, url := range event.MediaLink {
	// 	// this function will return an error if the file deletion is not successful, but it shouldn't affect the functionality
	// 	euc.CloudService.DeleteFromCloud(url)
	// 	if err != nil {
	// 		err = nil
	// 		// return euc.ErrorService.UnableToDeleteFile()
	// 	}
	// }

	err = euc.EventRepository.DeleteEvent(id)
	if err != nil {
		return euc.ErrorService.InternalServer()
	}
	return euc.ErrorService.NoError()
}
