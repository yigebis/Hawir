package Infrastructure

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func UserMiddleware(jwt_signer string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is missing"})
			c.Abort()
			return
		}

		authParts := strings.Split(authHeader, " ")
		if len(authParts) != 2 || strings.ToLower(authParts[0]) != "bearer" {
			fmt.Println(len(authParts), authParts[0])
			c.JSON(401, gin.H{"error": "invalid authorization header"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(authParts[1], func(token *jwt.Token) (interface{}, error) {
			_, ok := token.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwt_signer), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		exp := claims["exp"].(float64)
		if int64(exp) < time.Now().Unix() {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		if claims["role"].(string) != "user" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		c.Set("user", claims)
		fmt.Println(claims)
		c.Next()
	}
}

func AgencyMiddleWare(jwt_signer string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is missing"})
			c.Abort()
			return
		}

		authParts := strings.Split(authHeader, " ")
		if len(authParts) != 2 || strings.ToLower(authParts[0]) != "bearer" {
			c.JSON(401, gin.H{"error": "invalid authorization header"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(authParts[1], func(token *jwt.Token) (interface{}, error) {
			_, ok := token.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwt_signer), nil
		})

		if err != nil || !token.Valid {
			fmt.Println("1")
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			fmt.Println("2")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		exp := claims["exp"].(float64)
		if int64(exp) < time.Now().Unix() {
			fmt.Println("3")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		if claims["role"].(string) != "agency" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		c.Set("agency", claims)
		fmt.Println(claims)
		c.Next()
	}
}

func DriverAgencyMiddleware(jwt_signer string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is missing"})
			c.Abort()
			return
		}

		authParts := strings.Split(authHeader, " ")
		if len(authParts) != 2 || strings.ToLower(authParts[0]) != "bearer" {
			c.JSON(401, gin.H{"error": "invalid authorization header"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(authParts[1], func(token *jwt.Token) (interface{}, error) {
			_, ok := token.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwt_signer), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		exp := claims["exp"].(float64)
		if int64(exp) < time.Now().Unix() {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		// check if the role is either "driver" or "agency"
		if claims["role"].(string) != "driver" && claims["role"].(string) != "agency" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		c.Set(claims["role"].(string), claims)
		fmt.Println(claims)
		c.Next()
	}
}

func DriverMiddleware(jwt_signer string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is missing"})
			c.Abort()
			return
		}

		authParts := strings.Split(authHeader, " ")
		if len(authParts) != 2 || strings.ToLower(authParts[0]) != "bearer" {
			c.JSON(401, gin.H{"error": "invalid authorization header"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(authParts[1], func(token *jwt.Token) (interface{}, error) {
			_, ok := token.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwt_signer), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		exp := claims["exp"].(float64)
		if int64(exp) < time.Now().Unix() {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		// check if the role is "driver"
		if claims["role"].(string) != "driver" {
			// fmt.Println("role")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		c.Set("driver", claims)
		fmt.Println(claims)
		c.Next()
	}
}

func AdminMiddleware(jwt_signer string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is missing"})
			c.Abort()
			return
		}

		authParts := strings.Split(authHeader, " ")
		if len(authParts) != 2 || strings.ToLower(authParts[0]) != "bearer" {
			c.JSON(401, gin.H{"error": "invalid authorization header"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(authParts[1], func(token *jwt.Token) (interface{}, error) {
			_, ok := token.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwt_signer), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		exp := claims["exp"].(float64)
		if int64(exp) < time.Now().Unix() {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			c.Abort()
			return
		}

		// check if the role is "driver"
		if claims["role"].(string) != "admin" {
			// fmt.Println("role")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		c.Set("admin", claims)
		fmt.Println(claims)
		c.Next()
	}
}
