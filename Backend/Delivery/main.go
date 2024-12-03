package main

import (
	"Hawir/Delivery/Controller"
	"Hawir/Delivery/Router"
	"Hawir/Error"
	"Hawir/Infrastructure"
	"Hawir/Repository"
	"Hawir/UseCase"

	"context"
	"fmt"
	"log"
	"os"

	//comment it for production
	//"github.com/joho/godotenv"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	//comment it for production
	// if err := godotenv.Load(); err != nil {
	// 	log.Fatal("error loading .env file")
	// }

	// domain name of the website
	websiteDomainName := os.Getenv("WEBSITE_DOMAIN_NAME")
	// setting up the usecase

	//user usecase
	username := os.Getenv("MONGO_USERNAME")
	password := os.Getenv("MONGO_PASSWORD")
	uri := "mongodb+srv://" + username + ":" + password + "@cluster0.isgee.mongodb.net/"

	fmt.Print(uri)

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(context.TODO(), nil)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to db!")
	user_collection := client.Database("Hawir").Collection("users")

	user_context := context.TODO()

	ur := Repository.NewUserRepository(user_context, user_collection)

	jwtSecret := os.Getenv("JWT_SECRET")
	es := Error.NewErrorService()
	ps := Infrastructure.NewPasswordService(es)
	ts := Infrastructure.NewTokenService(jwtSecret)
	timeService := Infrastructure.NewTimeService()
	ms := Infrastructure.NewMailService(os.Getenv("SENDER_EMAIL"), os.Getenv("EMAIL_PASSWORD"), os.Getenv("FROM"), websiteDomainName)

	email_duration := os.Getenv("EMAIL_EXPIRY")
	token_duration := os.Getenv("TOKEN_EXPIRY")
	refresher_duration := os.Getenv("REFRESHER_EXPIRY")

	ex := timeService.GetDuration(email_duration)
	tx := timeService.GetDuration(token_duration)
	rx := timeService.GetDuration(refresher_duration)

	if ex == -1 || tx == -1 || rx == -1 {
		log.Fatal("error parsing time duration")
	}

	oauthState := os.Getenv("OAUTH_STATE_STRING")
	oauthClientID := os.Getenv("OAUTH_CLIENT_ID")
	oauthClientSecret := os.Getenv("OAUTH_CLIENT_SECRET")

	oauthService := Infrastructure.NewOAuth(oauthState, oauthClientID, oauthClientSecret, websiteDomainName)

	uuc := UseCase.NewUserUseCase(ur, ps, ts, ms, es, ex, tx, rx)

	// setting up the controllers
	user_controller := Controller.NewUserController(uuc, ts, oauthService, ps)

	// setting up the router
	router := Router.NewRouter(user_controller)
	router.Run()
}
