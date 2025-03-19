package Infrastructure

import (
	"Hawir/Error"
	"Hawir/UseCase"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type TokenService struct {
	JwtSecret string
}

func NewTokenService(jwtSecret string) UseCase.ITokenService {
	return &TokenService{JwtSecret: jwtSecret}
}

// GenerateToken implements UseCase.ITokenService.
func (ts *TokenService) GenerateToken(id string, firstName string, expiryDuration int64) (string, error) {
	claims := jwt.MapClaims{
		"id":         id,
		"first_name": firstName,
		"exp":        expiryDuration,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	jwtToken, err := token.SignedString([]byte(ts.JwtSecret))
	if err != nil {
		return "", err
	}

	return jwtToken, nil
}

func (ts *TokenService) GenerateEmailToken(email string, expiryDuration int64) (string, error) {
	claims := jwt.MapClaims{
		"email": email,
		"exp":   expiryDuration,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	jwtToken, err := token.SignedString([]byte(ts.JwtSecret))
	if err != nil {
		return "", err
	}

	return jwtToken, nil
}

func (ts *TokenService) GenerateAgencyToken(email string, role string, agencyID string, expiryDuration int64) (string, error) {
	claims := jwt.MapClaims{
		"email":     email,
		"exp":       expiryDuration,
		"role":      role,
		"agency_id": agencyID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	jwtToken, err := token.SignedString([]byte(ts.JwtSecret))
	if err != nil {
		return "", err
	}

	return jwtToken, nil
}

// ValidateToken implements UseCase.ITokenService.
func (ts *TokenService) ValidateToken(tokenString string) (map[string]interface{}, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(ts.JwtSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*jwt.MapClaims)

	if !ok || !token.Valid {
		return nil, Error.ErrInvalidToken
	}

	//check if the token is not expired
	claimsMap := *claims
	expirationTime := time.Unix(int64(claimsMap["exp"].(float64)), 0)

	if time.Now().After(expirationTime) {
		return nil, Error.ErrInvalidToken
	}

	return claimsMap, nil
}
