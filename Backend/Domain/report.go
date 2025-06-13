package Domain

type ActiveTravelersCount struct {
    Count int `json:"count" bson:"active_travelers_count"` // FIX: Corrected bson tag
}