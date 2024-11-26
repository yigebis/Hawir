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

	LectureNotFound() (int, error)
	TopicExists() (int, error)
	TopicNotExists() (int, error)
}
