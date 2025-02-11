package Domain

import "time"

type SearchParams struct {
	StartLocation string
	AgencyID      string
	Destination   string
	PriceMin      string
	PriceMax      string
	DateMin       time.Time
	DateMax       time.Time
	HasPayBack    bool
}
