package Repository

import (
	"Hawir/Domain"
	"Hawir/UseCase"
	"context"
	"fmt"
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
		BookingCollection:     bc,
		TravelStatsCollection: tsc,
		TravelCollection:      tc,
		Context:               ctx,
	}
}

func (rr *ReportRepository) GetBookHeatMap(agencyID string) (*map[string]int, error) {
	currentYear := time.Now().Year() // Or pass year as argument: func GetBookHeatMap(agencyID string, year int)

	// Calculate start and end times for the current year
	startTime := time.Date(currentYear, time.January, 1, 0, 0, 0, 0, time.UTC)
	endTime := time.Date(currentYear+1, time.January, 1, 0, 0, 0, 0, time.UTC) // Up to Jan 1st of next year

	pipeline := mongo.Pipeline{
		// Step 1: Match confirmed bookings within the specified year (using pay_time)
		{{Key: "$match", Value: bson.M{
			"status": Domain.BookingStatusPaid, // Use the defined constant for consistency
			"pay_time": bson.M{
				"$gte": startTime,
				"$lt":  endTime,
			},
		}}},

		// Step 2: Convert travel_id string to ObjectId for proper $lookup
		{{Key: "$addFields", Value: bson.M{
			"travel_id_objectId": bson.M{"$toObjectId": "$travel_id"},
		}}},

		// Step 3: Join with 'travels' collection on travel_id_objectId
		{{Key: "$lookup", Value: bson.M{
			"from":         "travels", // Consistent with FindConfirmedBookingsForUpcomingTravel
			"localField":   "travel_id_objectId",
			"foreignField": "_id",
			"as":           "travel_info", // Use a distinct name like "travel_info"
		}}},

		// Step 4: Deconstruct the travel_info array. This will filter out bookings
		// that didn't have a matching travel document (e.g., due to bad travel_id)
		{{Key: "$unwind", Value: "$travel_info"}},

		// Step 5: Match the desired agency from the joined travel document
		{{Key: "$match", Value: bson.M{"travel_info.agency_id": agencyID}}}, // Match on the joined travel document's agency_id

		// Step 6: Project only the formatted date from pay_time
		{{Key: "$project", Value: bson.M{
			"date": bson.M{
				"$dateToString": bson.M{
					"format": "%Y-%m-%d",
					"date":   "$pay_time",
				},
			},
		}}},

		// Step 7: Group by date and count occurrences
		{{Key: "$group", Value: bson.M{
			"_id":   "$date",
			"count": bson.M{"$sum": 1},
		}}},
	}

	cursor, err := rr.BookingCollection.Aggregate(rr.Context, pipeline)
	if err != nil {
		fmt.Printf("Aggregation pipeline error: %v\n", err)
		return nil, err
	}
	defer cursor.Close(rr.Context) // Ensure cursor is closed

	dateCounts := make(map[string]int)
	for cursor.Next(rr.Context) {
		var result struct {
			ID    string `bson:"_id"` // This will be the "YYYY-MM-DD" string
			Count int    `bson:"count"`
		}
		if err := cursor.Decode(&result); err == nil {
			dateCounts[result.ID] = result.Count
		} else {
			fmt.Printf("Error decoding cursor result: %v\n", err)
			// Continue processing other documents even if one fails
		}
	}

	if err := cursor.Err(); err != nil { // Check for errors during cursor iteration
		fmt.Printf("Cursor iteration error: %v\n", err)
		return nil, err
	}

	fmt.Println("Final dateCounts map:", dateCounts) // Debug print the populated map

	// If no bookings are found, dateCounts will be an empty map, which is correct
	// The UseCase layer will then convert this map into an array of zeros for the whole year.
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
	// Add time range for the current year, similar to GetBookHeatMap
	currentYear := time.Now().Year()
	startTime := time.Date(currentYear, time.January, 1, 0, 0, 0, 0, time.UTC)
	endTime := time.Date(currentYear+1, time.January, 1, 0, 0, 0, 0, time.UTC)

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"agency_id": agencyID,
			// Match trips that have actually started (i.e., actual_start_time exists and is not null)
			"actual_start_time": bson.M{
				"$exists": true,
				"$ne":     nil,
				"$gte":    startTime, // Add date range filter
				"$lt":     endTime,   // Add date range filter
			},
		}}},
		{{Key: "$project", Value: bson.M{
			// CRITICAL CHANGE: Use actual_start_time for the date in the heatmap
			"date": bson.M{
				"$dateToString": bson.M{
					"format": "%Y-%m-%d",
					"date":   "$actual_start_time", // <--- CHANGE THIS FROM $post_time
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
		fmt.Printf("Aggregation pipeline error in GetTripHeatMap: %v\n", err)
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
		} else {
			fmt.Printf("Error decoding trip heatmap cursor result: %v\n", err)
		}
	}

	if err := cursor.Err(); err != nil {
		fmt.Printf("Cursor iteration error in GetTripHeatMap: %v\n", err)
		return nil, err
	}

	fmt.Println("Final trip dateCounts map:", dateCounts) // Debug print

	return &dateCounts, nil
}

func (rr *ReportRepository) GetRevenueReport(agencyID string) (*map[string]int, error) {
	currentYear := time.Now().Year()
	startTime := time.Date(currentYear, time.January, 1, 0, 0, 0, 0, time.UTC)
	endTime := time.Date(currentYear+1, time.January, 1, 0, 0, 0, 0, time.UTC)

	pipeline := mongo.Pipeline{
		// Step 1: Match travel documents by agency_id, actual_start_time within year, and not cancelled status.
		// Input: All documents in the 'travels' collection.
		// Output: Filtered 'travels' documents.
		{{Key: "$match", Value: bson.M{
			"agency_id": agencyID,
			"post_time": bson.M{
				"$exists": true,
				"$ne":     time.Time{}, // Ensure it's not a zero value time.Time
				"$gte":    startTime,   // Filter for current year (e.g., 2025-01-01)
				"$lt":     endTime,     // Filter up to end of current year (e.g., 2026-01-01)
			},
			"status": bson.M{"$ne": "cancelled"}, // Exclude cancelled trips
		}}},
		// Step 2: Convert `_id` (ObjectID) from 'travels' collection to string for join.
		// This creates a new field "_id_string" on each 'travels' document.
		// Input: Filtered 'travels' documents.
		// Output: 'travels' documents with added "_id_string" field.
		{{Key: "$addFields", Value: bson.M{
			"_id_string": bson.M{"$toString": "$_id"}, // Convert ObjectID to string for matching
		}}},
		// Step 3: Lookup 'travel_stats' collection.
		// Join 'travels' documents with 'travel_stats' documents where 'travels._id_string' == 'travel_stats.travel_id'.
		// Input: 'travels' documents with "_id_string".
		// Output: 'travels' documents with an embedded 'stats' array containing matching 'travel_stats'.
		{{Key: "$lookup", Value: bson.M{
			"from":         "travel_stats", // Name of the travel stats collection
			"localField":   "_id_string",   // Field from the input documents ('travels')
			"foreignField": "travel_id",    // Field from the 'from' collection ('travel_stats')
			"as":           "stats",        // The name of the new array field added to input documents
		}}},
		// Step 4: Deconstruct the 'stats' array.
		// Creates a new document for each element in the 'stats' array. If 'stats' is empty, the document is filtered out.
		// Input: 'travels' documents with 'stats' array.
		// Output: Flat documents, each representing a 'travel' with one embedded 'travel_stats'.
		{{Key: "$unwind", Value: "$stats"}},
		// Step 5: Project the formatted date and calculate revenue.
		// This is where we calculate reserved_count from the 'seats' array.
		// Input: Flat documents from $unwind.
		// Output: Documents with 'date' and 'revenue' fields.
		{{Key: "$project", Value: bson.M{
			"date": bson.M{
				"$dateToString": bson.M{
					"format": "%Y-%m-%d",
					"date":   "$post_time", // Base the date on when the trip actually started
				},
			},
			"calculatedReservedCount": bson.M{ // NEW: Calculate reserved_count from 'seats' array
				"$sum": bson.M{
					"$map": bson.M{
						"input": "$stats.seats", // Iterate over the 'seats' array
						"as":    "seatStatus",   // Alias each element as 'seatStatus'
						"in": bson.M{
							"$cond": bson.A{
								"$$seatStatus", // If 'seatStatus' is true
								1,              // Then add 1
								0,              // Else add 0
							},
						},
					},
				},
			},
			"price": "$price", // Keep price for multiplication in the next step
		}}},
		// Step 6: Recalculate revenue using the new 'calculatedReservedCount'
		// This step is added to apply multiplication after seats are counted.
		{{Key: "$addFields", Value: bson.M{
			"revenue": bson.M{
				"$multiply": []interface{}{
					"$price",
					"$calculatedReservedCount",
				},
			},
		}}},
		// Step 7: Group by date and sum the calculated revenue.
		// This is the final aggregation step.
		// Input: Documents with 'date' and 'revenue' fields.
		// Output: Documents with '_id' (date string) and 'total' (summed daily revenue).
		{{Key: "$group", Value: bson.M{
			"_id":   "$date",                    // Group by the formatted date
			"total": bson.M{"$sum": "$revenue"}, // Sum all 'revenue' for each date
		}}},
	}

	// Defensive checks for initialized collections
	if rr.TravelCollection == nil {
		return nil, fmt.Errorf("ReportRepository.TravelCollection is nil. It must be initialized correctly.")
	}
	if rr.TravelStatsCollection == nil {
		return nil, fmt.Errorf("ReportRepository.TravelStatsCollection is nil. It must be initialized correctly.")
	}

	cursor, err := rr.TravelCollection.Aggregate(rr.Context, pipeline)
	if err != nil {
		fmt.Printf("Aggregation pipeline error in GetRevenueReport: %v\n", err)
		return nil, err
	}
	defer cursor.Close(rr.Context)

	dateCounts := make(map[string]int)
	for cursor.Next(rr.Context) {
		fmt.Println("insideeee!!")
		var result struct {
			ID    string  `bson:"_id"`   // The "YYYY-MM-DD" date string
			Total float64 `bson:"total"` // Revenue can be a float, decode as float64 first
		}
		if err := cursor.Decode(&result); err == nil {
			dateCounts[result.ID] = int(result.Total) // Convert to int for map, truncating decimals
		} else {
			fmt.Printf("Error decoding revenue report cursor result: %v\n", err)
		}
		fmt.Println(result)
	}

	if err := cursor.Err(); err != nil {
		fmt.Printf("Cursor iteration error in GetRevenueReport: %v\n", err)
		return nil, err
	}
	fmt.Println("Final revenue dateCounts map:", dateCounts)
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
