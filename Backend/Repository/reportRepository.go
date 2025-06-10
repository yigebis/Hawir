package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type ReportRepository struct {
	BookingCollection     *mongo.Collection
	TravelStatsCollection *mongo.Collection
	TravelCollection      *mongo.Collection
	Context               context.Context
}

func NewReportRepository(bc, tsc, tc *mongo.Collection, ctx context.Context) UseCase.IReportRepository {
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

func (rr *ReportRepository) GetActiveTravelersCount(agencyID string) (*Domain.ActiveTravelersCount, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"agencyID": agencyID, "status": "paid"}}},
		{{Key: "$group", Value: bson.M{
			"_id":   "$traveler_id",
			"count": bson.M{"$sum": 1},
		}}},
		{{Key: "$match", Value: bson.M{"count": bson.M{"$gte": 5}}}},
		{{Key: "$count", Value: "active_travelers_count"}},
	}

	cursor, err := rr.BookingCollection.Aggregate(rr.Context, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(rr.Context)

	var result Domain.ActiveTravelersCount

	if cursor.Next(rr.Context) {
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
	} else {
		return nil, cursor.Err()
	}

	return &result, nil

}

func (rr *ReportRepository) GetTopFiveDestinations(agencyID string) (*[]Domain.Destination, error) {
	pipeline := mongo.Pipeline{
		// step 1: join the travel_stats with travel
		{{Key: "$lookup", Value: bson.M{
			"from":         "travels",
			"localField":   "travel_id",
			"foreignField": "_id",
			"as":           "travel",
		}}},
		// step 2: unwind the travel array
		{{Key: "$unwind", Value: "$travel"}},

		// step 3: group by destination
		{{Key: "$group", Value: bson.M{
			"_id":           "$travel.destination",
			"totalReserved": bson.M{"$sum": "$reserved_count"},
		}}},

		// step 4: sort descending
		{{Key: "$sort", Value: bson.M{"totalReserved": -1}}},

		// step 5: limit to top 5
		{{Key: "$limit", Value: 5}},
	}

	cursor, err := rr.TravelStatsCollection.Aggregate(rr.Context, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(rr.Context)

	var destinations []Domain.Destination
	err = cursor.All(rr.Context, &destinations)
	if err != nil {
		return nil, err
	}

	return &destinations, nil
}

func (rr *ReportRepository) GetTripHeatMap(agencyID string) (*map[string]int, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"agency_id": agencyID,
			"actual_start_time": bson.M{
				"$exists": true,
				"$ne":     nil,
			},
		}}},
		{{Key: "$project", Value: bson.M{
			"date": bson.M{
				"$dateToString": bson.M{
					"format": "%Y-%m-%d",
					"date":   "$post_time",
				},
			},
		}}},
		{{Key: "$group", Value: bson.M{
			"_id":   "$date",
			"count": bson.M{"$sum": 1},
		}}},
	}

	cursor, err := rr.TravelCollection.Aggregate(rr.Context, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(rr.Context)

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

func (rr *ReportRepository) GetRevenueReport(agencyID string) (*map[string]int, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"agency_id": agencyID,
			"actual_start_time": bson.M{
				"$exists": true,
				"$ne":     time.Time{},
			},
			"status": bson.M{"$ne": "cancelled"},
		}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "travel_stats",
			"localField":   "_id",
			"foreignField": "travel_id",
			"as":           "stats",
		}}},
		{{Key: "$unwind", Value: "$stats"}},
		{{Key: "$project", Value: bson.M{
			"date": bson.M{
				"$dateToString": bson.M{
					"format": "%Y-%m-%d",
					"date":   "$actual_start_time",
				},
			},
			"revenue": bson.M{
				"$multiply": []interface{}{"$price", "$stats.reserved_count"},
			},
		}}},
		{{Key: "$group", Value: bson.M{
			"_id":   "$date",
			"total": bson.M{"$sum": "$revenue"},
		}}},
	}

	cursor, err := rr.TravelCollection.Aggregate(rr.Context, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(rr.Context)

	dateCounts := make(map[string]int)
	for cursor.Next(rr.Context) {
		var result struct {
			ID    string `bson:"_id"`
			Total int    `bson:"total"`
		}
		if err := cursor.Decode(&result); err == nil {
			dateCounts[result.ID] = result.Total
		}
	}

	return &dateCounts, nil
}

func (rr *ReportRepository) GetNewCustomersReport(agencyID string) (*map[string]int, error) {
	pipeline := mongo.Pipeline{
		// Step 1: Match paid bookings for the agency
		{{Key: "$match", Value: bson.M{"agencyId": agencyID, "status": "paid"}}},

		// Step 2: Group by traveler and get their first pay_time (first ever payment)
		{{Key: "$group", Value: bson.M{
			"_id":       "$travelerId",
			"firstDate": bson.M{"$min": "$pay_time"},
		}}},

		// Step 3: Format firstDate to "YYYY-MM-DD"
		{{Key: "$project", Value: bson.M{
			"date": bson.M{
				"$dateToString": bson.M{
					"format": "%Y-%m-%d",
					"date":   "$firstDate",
				},
			},
		}}},

		// Step 4: Group by date to count new customers per day
		{{Key: "$group", Value: bson.M{
			"_id":   "$date",
			"count": bson.M{"$sum": 1},
		}}},

		// Step 5: Sort by date ascending
		{{Key: "$sort", Value: bson.M{"_id": 1}}},
	}

	cursor, err := rr.BookingCollection.Aggregate(rr.Context, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(rr.Context)

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
