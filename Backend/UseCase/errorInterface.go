package UseCase

type IErrorService interface {
	NoError() (int, error)
	InternalServer() (int, error)

	UserExists() (int, error)
	PendingVerification() (int, error)
	InvalidToken() (int, error)
	UserNotFound() (int, error)
	InvalidEmailPassword() (int, error)
	InvalidUserNamePassword() (int, error)
	InvalidEmailRefresher() (int, error)
	NotVerified() (int, error)
	SamePassword() (int, error)
	NotAuthorized() (int, error)
	PasswordTooShort() (int, error)
	MissingValidPasswordChar() (int, error)
	InvalidPhoneNumber() (int, error)

	// Travel errors
	TravelNotFound() (int, error)

	// Agency errors
	AgencyNotFound() (int, error)

	// Booking errors
	BookingNotFound() (int, error)
}
