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
        // Step 1: Match only "paid" bookings in the BookingCollection.
        // Input: All documents in 'BookingCollection'.
        // Output: Filtered booking documents.
        {{Key: "$match", Value: bson.M{"status": "confirmed"}}},

        // Step 2: Convert booking.travel_id (string) to ObjectID.
        // This is necessary to join with 'travels._id' which is an ObjectID.
        // Input: Filtered booking documents.
        // Output: Booking documents with a new field 'travel_id_objectId'.
        {{Key: "$addFields", Value: bson.M{
            "travel_id_objectId": bson.M{"$toObjectId": "$travel_id"},
        }}},
        // Step 3: Join with 'travels' collection.
        // This brings in the 'agency_id' from the 'travels' document.
        // Input: Booking documents with 'travel_id_objectId'.
        // Output: Booking documents with an embedded 'travel_info' array (containing matched 'travels').
        {{Key: "$lookup", Value: bson.M{
            "from":         "travels",            // The collection to join with
            "localField":   "travel_id_objectId", // Field from the input documents (bookings)
            "foreignField": "_id",                // Field from the 'from' collection (travels)
            "as":           "travel_info",        // The name of the new array field
        }}},
        // Step 4: Deconstruct the 'travel_info' array.
        // Ensures only bookings linked to a travel document are processed.
        // Input: Documents with 'travel_info' array.
        // Output: Flattened documents, each representing a booking with one embedded travel.
        {{Key: "$unwind", Value: "$travel_info"}},

        // Step 5: Match by agencyID.
        // This filters the joined documents to only include bookings linked to trips
        // belonging to the specified agency.
        // Input: Flattened documents.
        // Output: Documents filtered by agencyID.
        {{Key: "$match", Value: bson.M{"travel_info.agency_id": agencyID}}},

        // Step 6: Group by traveler_id and count their total paid bookings.
        // Input: Filtered documents.
        // Output: Documents with '_id' (traveler_id) and 'count' (total paid bookings for that traveler).
        {{Key: "$group", Value: bson.M{
            "_id":   "$traveler_id", // Group by the traveler's ID
            "count": bson.M{"$sum": 1}, // Count each paid booking for the traveler
        }}},

        // Step 7: Filter for travelers who have at least 5 paid bookings.
        // Input: Grouped documents.
        // Output: Documents where 'count' is >= 5.
        {{Key: "$match", Value: bson.M{"count": bson.M{"$gte": 1}}}}, // <----------------------------------------******

        // Step 8: Count the number of remaining documents (which are the active travelers).
        // Input: Filtered grouped documents.
        // Output: A single document like { "active_travelers_count": N }.
        {{Key: "$count", Value: "active_travelers_count"}}, // Names the output field
    }

    // Defensive checks for initialized collections
    if rr.BookingCollection == nil {
        return nil, fmt.Errorf("ReportRepository.BookingCollection is nil. It must be initialized correctly.")
    }
    if rr.TravelCollection == nil {
        return nil, fmt.Errorf("ReportRepository.TravelCollection is nil. It must be initialized correctly.")
    }

    cursor, err := rr.BookingCollection.Aggregate(rr.Context, pipeline)
    if err != nil {
        fmt.Printf("Aggregation pipeline error in GetActiveTravelersCount: %v\n", err)
        return nil, err
    }
    defer cursor.Close(rr.Context)

    var result Domain.ActiveTravelersCount // Use the struct with the correct bson tag

    // The $count stage always returns at most one document.
    // If there are no active travelers, the $count stage will return an empty cursor,
    // not a document with count 0. So we need to handle that.
    if cursor.Next(rr.Context) {
        if err := cursor.Decode(&result); err != nil {
            fmt.Printf("Error decoding active travelers count result: %v\n", err)
            return nil, err
        }
    } else {
        // If cursor has no next document, it means $count returned 0.
        // In this case, result.Count will remain its zero-value (0), which is correct.
        if cursor.Err() != nil { // Check if there was an error during cursor iteration
            fmt.Printf("Cursor iteration error in GetActiveTravelersCount: %v\n", err)
            return nil, cursor.Err()
        }
        // No documents found, so count is 0. 'result' already has Count: 0.
        fmt.Println("No active travelers found (count is 0).")
    }

    fmt.Println("Final Active Travelers Count:", result.Count) // Debug print
    return &result, nil
}

func (rr *ReportRepository) GetTopFiveDestinations(agencyID string) (*[]Domain.TopDestinationReportItem, error) { // CHANGED RETURN TYPE
    pipeline := mongo.Pipeline{
        // Step 1: Convert travel_stats.travel_id (string) to ObjectID.
        // This is crucial for joining with 'travels._id' which is an ObjectID.
        // Input: Documents from 'travel_stats' collection.
        // Output: travel_stats documents with a new field 'travel_id_objectId'.
        {{Key: "$addFields", Value: bson.M{
            "travel_id_objectId": bson.M{"$toObjectId": "$travel_id"},
        }}},
        // Step 2: Join with 'travels' collection.
        // We join based on the converted ObjectID from 'travel_stats' and the '_id' from 'travels'.
        // This brings in the 'destination' and 'agency_id' from the 'travels' document.
        // Input: travel_stats documents with 'travel_id_objectId'.
        // Output: travel_stats documents with an embedded 'travel_info' array (containing matched 'travels').
        {{Key: "$lookup", Value: bson.M{
            "from":         "travels",            // The collection to join with
            "localField":   "travel_id_objectId", // Field from the input documents (travel_stats)
            "foreignField": "_id",                // Field from the 'from' collection (travels)
            "as":           "travel_info",        // The name of the new array field
        }}},
        // Step 3: Deconstruct the 'travel_info' array.
        // This creates a separate document for each matched travel. If no travel matched, the travel_stats document is removed.
        // Input: Documents with 'travel_info' array.
        // Output: Flattened documents, each representing a travel_stats record with one embedded travel.
        {{Key: "$unwind", Value: "$travel_info"}},

        // Step 4: Match by agencyID.
        // This filters the joined documents to only include trips belonging to the specified agency.
        // Input: Flattened documents from $unwind.
        // Output: Documents filtered by agencyID.
        {{Key: "$match", Value: bson.M{"travel_info.agency_id": agencyID}}},

        // Step 5: Calculate reserved seats from 'seats' array for each travel_stats document.
        // This solves the 'reserved_count' being 0 problem by counting actual true seats.
        // Input: Documents filtered by agencyID.
        // Output: Documents with a new field 'calculatedReservedCount'.
        {{Key: "$addFields", Value: bson.M{
            "calculatedReservedCount": bson.M{
                "$sum": bson.M{
                    "$map": bson.M{
                        "input": "$seats",       // The boolean array from travel_stats
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
        }}},
        // Step 6: Group by destination and sum the calculated reserved counts.
        // This aggregates the data to get total travelers for each destination.
        // Input: Documents with 'calculatedReservedCount'.
        // Output: Documents with '_id' (destination name) and 'totalTravelers' (summed reserved seats).
        {{Key: "$group", Value: bson.M{
            "_id":            "$travel_info.destination", // Group by destination from the joined travel info
            "totalTravelers": bson.M{"$sum": "$calculatedReservedCount"}, // Sum the calculated reserved seats
        }}},
        // Step 7: Sort by totalTravelers in descending order.
        // This orders the destinations from most popular to least popular.
        // Input: Grouped documents.
        // Output: Sorted documents.
        {{Key: "$sort", Value: bson.M{"totalTravelers": -1}}},
        // Step 8: Limit to the top 5.
        // This selects only the top 5 most popular destinations.
        // Input: Sorted documents.
        // Output: The top 5 destination documents.
        {{Key: "$limit", Value: 5}},
    }

    // Defensive checks for initialized collections
    if rr.TravelStatsCollection == nil {
        return nil, fmt.Errorf("ReportRepository TravelStatsCollection is nil It must be initialized correctly")
    }
    if rr.TravelCollection == nil {
        return nil, fmt.Errorf("ReportRepository TravelCollection is nil It must be initialized correctly")
    }

    // Execute the aggregation pipeline on the TravelStatsCollection
    cursor, err := rr.TravelStatsCollection.Aggregate(rr.Context, pipeline)
    if err != nil {
        fmt.Printf("Aggregation pipeline error in GetTopFiveDestinations: %v\n", err)
        return nil, err
    }
    defer cursor.Close(rr.Context)

    // Decode the results into a slice of TopDestinationReportItem
    var topDestinations []Domain.TopDestinationReportItem
    err = cursor.All(rr.Context, &topDestinations)
    if err != nil {
        fmt.Printf("Error decoding top destinations aggregation results: %v\n", err)
        return nil, err
    }

    return &topDestinations, nil
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
		var result struct {
			ID    string  `bson:"_id"`   // The "YYYY-MM-DD" date string
			Total float64 `bson:"total"` // Revenue can be a float, decode as float64 first
		}
		if err := cursor.Decode(&result); err == nil {
			dateCounts[result.ID] = int(result.Total) // Convert to int for map, truncating decimals
		} else {
			fmt.Printf("Error decoding revenue report cursor result: %v\n", err)
		}
	}

	if err := cursor.Err(); err != nil {
		fmt.Printf("Cursor iteration error in GetRevenueReport: %v\n", err)
		return nil, err
	}
	return &dateCounts, nil
}

func (rr *ReportRepository) GetNewCustomersReport(agencyID string) (*map[string]int, error) {
    pipeline := mongo.Pipeline{
        // Step 1: Match only "paid" bookings.
        // This ensures we only consider successful bookings for new customer definition.
        {{Key: "$match", Value: bson.M{"status": "confirmed"}}},

        // Step 2: Convert booking.travel_id (string) to ObjectID for lookup.
        // This is necessary to join with 'travels._id' which is an ObjectID.
        {{Key: "$addFields", Value: bson.M{
            "travel_id_objectId": bson.M{"$toObjectId": "$travel_id"},
        }}},
        // Step 3: Join with 'travels' collection.
        // This brings in the 'agency_id' from the 'travels' document, essential for filtering.
        {{Key: "$lookup", Value: bson.M{
            "from":         "travels",
            "localField":   "travel_id_objectId",
            "foreignField": "_id",
            "as":           "travel_info",
        }}},
        // Step 4: Deconstruct the 'travel_info' array.
        // Ensures only bookings linked to a travel document are processed.
        {{Key: "$unwind", Value: "$travel_info"}},

        // Step 5: Filter by agencyID using the joined 'travel_info'.
        // This ensures we only count new customers for the specified agency.
        {{Key: "$match", Value: bson.M{"travel_info.agency_id": agencyID}}},

        // Step 6: Group by traveler_id to find the earliest (first) paid booking date for each traveler.
        // This identifies the "first time" a traveler made a paid booking with this specific agency.
        {{Key: "$group", Value: bson.M{
            "_id":       "$traveler_id", // Group by the traveler's ID
            "firstDate": bson.M{"$min": "$pay_time"}, // Find the minimum (earliest) pay_time
        }}},

        // Step 7: Project the firstDate into a "YYYY-MM-DD" string format.
        // This prepares the date for grouping by day.
        {{Key: "$project", Value: bson.M{
            "date": bson.M{
                "$dateToString": bson.M{
                    "format": "%Y-%m-%d",
                    "date":   "$firstDate", // Use the calculated firstDate
                },
            },
        }}},

        // Step 8: Group by the formatted date to count new customers per day.
        // Each document now represents a unique traveler's first paid booking date.
        // Summing them gives the count of new customers for that day.
        {{Key: "$group", Value: bson.M{
            "_id":   "$date",    // Group by the formatted date string
            "count": bson.M{"$sum": 1}, // Count each unique traveler for that date
        }}},

        // Step 9: Sort by date ascending.
        // This is important for the UseCase layer to correctly build a time-series array.
        {{Key: "$sort", Value: bson.M{"_id": 1}}},
    }

    // Defensive checks for initialized collections
    if rr.BookingCollection == nil {
        return nil, fmt.Errorf("ReportRepository BookingCollection is nil It must be initialized correctly")
    }
    if rr.TravelCollection == nil { // Ensure TravelCollection is checked as it's used in lookup
        return nil, fmt.Errorf("ReportRepository TravelCollection is nil It must be initialized correctly")
    }


    cursor, err := rr.BookingCollection.Aggregate(rr.Context, pipeline)
    if err != nil {
        fmt.Printf("Aggregation pipeline error in GetNewCustomersReport: %v\n", err)
        return nil, err
    }
    defer cursor.Close(rr.Context)

    dateCounts := make(map[string]int)
    for cursor.Next(rr.Context) {
        var result struct {
            ID    string `bson:"_id"` // The date string "YYYY-MM-DD"
            Count int    `bson:"count"`
        }
        if err := cursor.Decode(&result); err == nil {
            dateCounts[result.ID] = result.Count
        } else {
            fmt.Printf("Error decoding new customers report cursor result: %v\n", err)
        }
    }
    if err := cursor.Err(); err != nil {
        fmt.Printf("Cursor iteration error in GetNewCustomersReport: %v\n", err)
        return nil, err
    }
    fmt.Println("Final new customers dateCounts map:", dateCounts)
    return &dateCounts, nil
}

func (rr *ReportRepository) GetTotalCustomersCount(agencyID string) (*Domain.ActiveTravelersCount, error) {
    pipeline := mongo.Pipeline{
        // Step 1: Match only "paid" bookings.
        {{Key: "$match", Value: bson.M{"status": "confirmed"}}},

        // Step 2: Convert booking.travel_id (string) to ObjectID for lookup.
        {{Key: "$addFields", Value: bson.M{
            "travel_id_objectId": bson.M{"$toObjectId": "$travel_id"},
        }}},
        // Step 3: Join with 'travels' collection.
        // This brings in the 'agency_id' from the 'travels' document, essential for filtering.
        {{Key: "$lookup", Value: bson.M{
            "from":         "travels",            // The collection to join with
            "localField":   "travel_id_objectId", // Field from the input documents (bookings)
            "foreignField": "_id",                // Field from the 'from' collection (travels)
            "as":           "travel_info",        // The name of the new array field
        }}},
        // Step 4: Deconstruct the 'travel_info' array.
        // Ensures only bookings linked to a travel document are processed.
        {{Key: "$unwind", Value: "$travel_info"}},

        // Step 5: Filter by agencyID using the joined 'travel_info'.
        // This ensures we only count customers for the specified agency.
        {{Key: "$match", Value: bson.M{"travel_info.agency_id": agencyID}}},

        // Step 6: Group by a composite _id: combination of first_name, last_name, AND traveler_id.
        // This ensures that "John Doe booked by A" is distinct from "John Doe booked by B".
        {{Key: "$group", Value: bson.M{
            "_id": bson.M{
                "firstName": "$first_name",
                "lastName":  "$last_name",
                "bookerId":  "$traveler_id", // <-- KEY CHANGE: Include traveler_id in the composite key
            },
        }}},

        // Step 7: Count the total number of unique composite _id combinations found.
        {{Key: "$count", Value: "active_travelers_count"}}, // Reusing the bson tag that Domain.ActiveTravelersCount expects
    }

    // Defensive checks for initialized collections
    if rr.BookingCollection == nil {
        return nil, fmt.Errorf("ReportRepository BookingCollection is nil It must be initialized correctly")
    }
    if rr.TravelCollection == nil { // Ensure TravelCollection is checked as it's used in lookup
        return nil, fmt.Errorf("ReportRepository TravelCollection is nil It must be initialized correctly")
    }

    cursor, err := rr.BookingCollection.Aggregate(rr.Context, pipeline)
    if err != nil {
        fmt.Printf("Aggregation pipeline error in GetTotalCustomersCount (by Name + Booker ID): %v\n", err)
        return nil, err
    }
    defer cursor.Close(rr.Context)

    var result Domain.ActiveTravelersCount // Still using this struct
    if cursor.Next(rr.Context) {
        if err := cursor.Decode(&result); err != nil {
            fmt.Printf("Error decoding total customers count result (by Name + Booker ID): %v\n", err)
            return nil, err
        }
    } else {
        // If no documents are returned by $count, it means the count is 0.
        if cursor.Err() != nil {
            fmt.Printf("Cursor error in GetTotalCustomersCount (by Name + Booker ID) after checking Next: %v\n", cursor.Err())
            return nil, cursor.Err()
        }
        fmt.Println("No total customers found (count is 0) by Name + Booker ID.") // Log for clarity when count is 0
    }

    fmt.Println("Final Total Customers Count (by Name + Booker ID):", result.Count) // Debug print
    return &result, nil
}
