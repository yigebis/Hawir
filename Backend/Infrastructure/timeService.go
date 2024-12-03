package Infrastructure

import (
	"strconv"
	"time"
)

type TimeService struct {
}

func NewTimeService() *TimeService {
	return &TimeService{}
}

func (ts *TimeService) GetDuration(duration string) int64 {
	seconds, err := strconv.Atoi(duration)
	if err != nil {
		return -1
	}
	return time.Now().Add(time.Second * time.Duration(seconds)).Unix()
}
