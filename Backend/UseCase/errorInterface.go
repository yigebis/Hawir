package UseCase

type IErrorService interface {
	NoError() (int, error)
	InternalServer() (int, error)

	UserExists() (int, error)
	PendingVerification() (int, error)
	InvalidToken() (int, error)
	UserNotFound() (int, error)
	InvalidEmailPassword() (int, error)
	// InvalidUserNamePassword() (int, error)
	InvalidEmailRefresher() (int, error)
	NotVerified() (int, error)
	SamePassword() (int, error)
	NotAuthorized() (int, error)
	PasswordTooShort() (int, error)
	MissingValidPasswordChar() (int, error)
	InvalidPhoneNumber() (int, error)
	InvalidName() (int, error)

	// agency user errors
	InvalidEmailAgencyIDPassword() (int, error)

	// Travel errors
	TravelNotFound() (int, error)
	InvalidStartLocation() (int, error)
	InvalidPlannedStartTime() (int, error)
	InvalidEstArrivalTime() (int, error)
	InvalidPrice() (int, error)

	// Agency errors
	AgencyNotFound() (int, error)

	// Booking errors
	BookingNotFound() (int, error)
	SeatReserved() (int, error)
	TravelerAlreadyBooked() (int, error)
	SeatNotChosen() (int, error)
	IncorrectSeatNumber() (int, error)

	// Destination errors
	DestinationNotFound() (int, error)
}
