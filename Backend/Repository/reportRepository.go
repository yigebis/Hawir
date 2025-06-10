package Repository

import (
	"Hawir/UseCase"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type ReportRepository struct {
	BookingCollection *mongo.Collection
	Context           context.Context
}

func NewReportRepository(bc *mongo.Collection, ctx context.Context) UseCase.IReportRepository {
	return &ReportRepository{
		BookingCollection: bc,
		Context:           ctx,
	}
}

func (rr *ReportRepository) GetBookHeatMap(agencyID string) (*map[string]int, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"agencyId": agencyID, "status": "paid"}}},
		{{Key: "$project", Value: bson.M{
			"date": bson.M{
				"$dateToString": bson.M{
					"format": "%Y-%m-%d",
					"date":   "$pay_time",
				},
			},
		}}},
		{{Key: "$group", Value: bson.M{
			"_id":   "$date",
			"count": bson.M{"$sum": 1},
		}}},
	}

	cursor, err := rr.BookingCollection.Aggregate(rr.Context, pipeline)
	if err != nil {
		return nil, err
	}

	dateCounts := make(map[string]int)
	for cursor.Next(rr.Context) {
		var result struct {
			ID    string `bson:"_id"`
			Count int    `bson:"count"`
		}
		if err := cursor.Decode(&result); err == nil {
			dateCounts[result.ID] = result.Count
		}
	}

	return &dateCounts, nil
}
