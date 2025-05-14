package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type EventRepository struct {
	EventCollection *mongo.Collection
	EventContext    context.Context
}

func NewEventRepository(eventContext context.Context, eventCollection *mongo.Collection) UseCase.IEventRepository {
	return &EventRepository{
		EventContext:    eventContext,
		EventCollection: eventCollection,
	}
}

func (er *EventRepository) AddEvent(event *Domain.Event) error {
	_, err := er.EventCollection.InsertOne(er.EventContext, event)
	if err != nil {
		return err
	}
	return nil
}

func (er *EventRepository) GetEventByID(id string) (*Domain.Event, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	filter := bson.M{"_id": objID}

	var event Domain.Event
	err = er.EventCollection.FindOne(er.EventContext, filter).Decode(&event)
	if err != nil {
		return nil, err
	}

	return &event, nil
}

func (er *EventRepository) GetAllEvents(skip, limit int, eventFilter *Domain.EventFilter) (*[]Domain.Event, error) {
	filter := bson.M{}
	if eventFilter.Title != "" {
		filter["title"] = bson.M{"$regex": eventFilter.Title, "$options": "i"}
	}
	if eventFilter.DestinationID != "" {
		filter["destination_id"] = eventFilter.DestinationID
	}
	if !eventFilter.DateMin.IsZero() {
		filter["date"] = bson.M{"$gte": eventFilter.DateMin}
	}
	if !eventFilter.DateMax.IsZero() {
		filter["date"] = bson.M{"$lte": eventFilter.DateMax}
	}

	opts := options.Find().SetSkip(int64((skip))).SetLimit(int64(limit)).SetSort(bson.M{"date": -1})
	cursor, err := er.EventCollection.Find(er.EventContext, filter, opts)
	if err != nil {
		return nil, err
	}

	var events []Domain.Event
	err = cursor.All(er.EventContext, &events)
	if err != nil {
		return nil, err
	}

	return &events, nil
}

func (er *EventRepository) EditEvent(id string, event *Domain.Event) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	filter := bson.M{"_id": objID}
	update := bson.M{"$set": event}

	_, err = er.EventCollection.UpdateOne(er.EventContext, filter, update)
	if err != nil {
		return err
	}

	return nil
}

func (er *EventRepository) DeleteEvent(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	filter := bson.M{"_id": objID}

	_, err = er.EventCollection.DeleteOne(er.EventContext, filter)
	if err != nil {
		return err
	}

	return nil
}
