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
var ErrInvalidUserNamePassword = errors.New("invalid username or password")
var ErrInvalidEmailRefresher = errors.New("invalid email or refresher")
var ErrNotVerified = errors.New("unverified user")
var ErrSamePassword = errors.New("old and new password should be different")
var ErrNotAuthorized = errors.New("unauthorized")

var ErrPasswordTooShort = errors.New("password should be at least 8 characters")
var ErrMissingValidPasswordChar = errors.New("password should contain at least one uppercase, one lowercase, one number, and one special character")

var ErrInvalidPhoneNumber = errors.New("invalid Phone Number")

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

func (e *Error) InvalidUserNamePassword() (int, error) {
	return http.StatusBadRequest, ErrInvalidUserNamePassword
}

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

func (e *Error) InvalidPhoneNumber() (int, error){
	return http.StatusBadRequest, ErrInvalidPhoneNumber
}
