package Error

import (
	"Hawir/UseCase"
	"errors"
	"net/http"
)

type ErrorService struct{}

var ErrInternalServer = errors.New("internal server error")

var ErrUserExists = errors.New("user already exists")
var ErrPendingVerification = errors.New("registration is waiting email verification")
var ErrInvalidToken = errors.New("invalid token")
var ErrUserNotFound = errors.New("not found")
var ErrInvalidEmailPassword = errors.New("invalid email or password")

// var ErrInvalidUserNamePassword = errors.New("invalid username or password")
var ErrInvalidEmailRefresher = errors.New("invalid email or refresher")
var ErrNotVerified = errors.New("unverified user")
var ErrSamePassword = errors.New("old and new password should be different")
var ErrNotAuthorized = errors.New("unauthorized")

var ErrPasswordTooShort = errors.New("password should be at least 8 characters")
var ErrMissingValidPasswordChar = errors.New("password should contain at least one uppercase, one lowercase, one number, and one special character")

var ErrInvalidPhoneNumber = errors.New("invalid Phone Number")
var ErrInvalidName = errors.New("invalid name")

var ErrOpeningFile = errors.New("error opening file")
var ErrCopyingFile = errors.New("error copying file")
var ErrSeekingFile = errors.New("error seeking file")
var ErrCreatingFile = errors.New("error creating file")
var ErrUploadingFile = errors.New("error uploading file")

// agency user errors
var ErrInvalidEmailAgencyIDPassword = errors.New("invalid email or agency ID or password")

// Travel errors
var ErrTravelNotFound = errors.New("travel not found")
var ErrInvalidEstArrivalTime = errors.New("estimated arrival time is before the planned start time")
var ErrInvalidStartTime = errors.New("planned start time is in the past")
var ErrStartPickupLocation = errors.New("start location is not in the pickup locations")
var ErrInvalidPrice = errors.New("price is invalid")
var ErrDriverBusy = errors.New("driver is busy")

// Agency errors
var ErrAgencyNotFound = errors.New("agency not found")
var ErrBusNotFound = errors.New("bus not found")

// bus errors
var ErrIncorrectPlateNumber = errors.New("incorrect plate number")

// Booking errors
var ErrBookingNotFound = errors.New("booking not found")
var ErrSeatReserved = errors.New("seat is already reserved")
var ErrTravelerAlreadyBooked = errors.New("traveler has already booked a seat")
var ErrSeatNotChosen = errors.New("traveler has not chosen a seat")
var ErrIncorrectSeatNumber = errors.New("seat number is incorrect")
var ErrSeatsNotFound = errors.New("seats not found")

// Destination errors
var ErrDestinationNotFound = errors.New("destination not found")
var ErrDestinationAlreadyExists = errors.New("destination already exists")

// Event errors
var ErrInvalidEventDate = errors.New("event date should be in the future")
var ErrEventNotFound = errors.New("event not found")

type Error struct{}

func NewErrorService() UseCase.IErrorService {
	return &Error{}
}

func (e *Error) NoError() (int, error) {
	return http.StatusOK, nil
}

func (e *Error) UserExists() (int, error) {
	return http.StatusConflict, ErrUserExists
}

func (e *Error) PendingVerification() (int, error) {
	return http.StatusConflict, ErrPendingVerification
}

func (e *Error) InternalServer() (int, error) {
	return http.StatusInternalServerError, ErrInternalServer
}

func (e *Error) InvalidToken() (int, error) {
	return http.StatusBadRequest, ErrInvalidToken
}

func (e *Error) UserNotFound() (int, error) {
	return http.StatusNotFound, ErrUserNotFound
}

func (e *Error) InvalidEmailPassword() (int, error) {
	return http.StatusBadRequest, ErrInvalidEmailPassword
}

// func (e *Error) InvalidUserNamePassword() (int, error) {
// 	return http.StatusBadRequest, ErrInvalidUserNamePassword
// }

func (e *Error) InvalidEmailRefresher() (int, error) {
	return http.StatusBadRequest, ErrInvalidEmailRefresher
}

func (e *Error) NotVerified() (int, error) {
	return http.StatusBadRequest, ErrNotVerified
}

func (e *Error) SamePassword() (int, error) {
	return http.StatusBadRequest, ErrSamePassword
}

func (e *Error) NotAuthorized() (int, error) {
	return http.StatusUnauthorized, ErrNotAuthorized
}

func (e *Error) PasswordTooShort() (int, error) {
	return http.StatusBadRequest, ErrPasswordTooShort
}

func (e *Error) MissingValidPasswordChar() (int, error) {
	return http.StatusBadRequest, ErrMissingValidPasswordChar
}

func (e *Error) InvalidPhoneNumber() (int, error) {
	return http.StatusBadRequest, ErrInvalidPhoneNumber
}

func (e *Error) InvalidName() (int, error) {
	return http.StatusBadRequest, ErrInvalidName
}

func (e *Error) UnableToCopyFile() (int, error) {
	return http.StatusInternalServerError, ErrCopyingFile
}

func (e *Error) UnableToCreateFile() (int, error) {
	return http.StatusInternalServerError, ErrCreatingFile
}

func (e *Error) UnableToOpenFile() (int, error) {
	return http.StatusInternalServerError, ErrOpeningFile
}

func (e *Error) UnableToSeekFile() (int, error) {
	return http.StatusInternalServerError, ErrSeekingFile
}

func (e *Error) UnableToUploadFile() (int, error) {
	return http.StatusInternalServerError, ErrUploadingFile
}

// Travel errors
func (e *Error) TravelNotFound() (int, error) {
	return http.StatusNotFound, ErrTravelNotFound
}

func (e *Error) InvalidPrice() (int, error) {
	return http.StatusBadRequest, ErrInvalidPrice
}

func (e *Error) DriverBusy() (int, error) {
	return http.StatusConflict, ErrDriverBusy
}

// Agency errors
func (e *Error) AgencyNotFound() (int, error) {
	return http.StatusNotFound, ErrAgencyNotFound
}

func (e *Error) IncorrectPlateNo() (int, error) {
	return http.StatusBadRequest, ErrIncorrectPlateNumber
}

func (e *Error) BusNotFound() (int, error) {
	return http.StatusNotFound, ErrBusNotFound
}

// Booking errors
func (e *Error) BookingNotFound() (int, error) {
	return http.StatusNotFound, ErrBookingNotFound
}

func (e *Error) SeatReserved() (int, error) {
	return http.StatusBadRequest, ErrSeatReserved
}

func (e *Error) TravelerAlreadyBooked() (int, error) {
	return http.StatusBadRequest, ErrTravelerAlreadyBooked
}

func (e *Error) SeatNotChosen() (int, error) {
	return http.StatusBadRequest, ErrSeatNotChosen
}

func (e *Error) InvalidStartLocation() (int, error) {
	return http.StatusBadRequest, ErrStartPickupLocation
}

func (e *Error) InvalidPlannedStartTime() (int, error) {
	return http.StatusBadRequest, ErrInvalidStartTime
}

func (e *Error) InvalidEstArrivalTime() (int, error) {
	return http.StatusBadRequest, ErrInvalidEstArrivalTime
}

func (e *Error) IncorrectSeatNumber() (int, error) {
	return http.StatusBadRequest, ErrIncorrectSeatNumber
}

func (e *Error) InvalidEmailAgencyIDPassword() (int, error) {
	return http.StatusBadRequest, ErrInvalidEmailAgencyIDPassword
}

func (e *Error) SeatsNotFound() (int, error) {
	return http.StatusNotFound, ErrSeatsNotFound
}

// Destination errors
func (e *Error) DestinationNotFound() (int, error) {
	return http.StatusNotFound, ErrDestinationNotFound
}

func (e *Error) DestinationAlreadyExists() (int, error) {
	return http.StatusConflict, ErrDestinationAlreadyExists
}

// Event errors
func (e *Error) InvalidEventDate() (int, error) {
	return http.StatusBadRequest, ErrInvalidEventDate
}

func (e *Error) EventNotFound() (int, error) {
	return http.StatusNotFound, ErrEventNotFound
}
