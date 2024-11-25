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

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("error loading .env file")
	}

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
	ps := Infrastructure.NewPasswordService()
	ts := Infrastructure.NewTokenService(jwtSecret)
	ms := Infrastructure.NewMailService(os.Getenv("SENDER_EMAIL"), os.Getenv("EMAIL_PASSWORD"), os.Getenv("FROM"))
	es := Error.NewErrorService()

	ex := os.Getenv("EMAIL_EXPIRY")
	tx := os.Getenv("TOKEN_EXPIRY")

	uuc := UseCase.NewUserUseCase(ur, ps, ts, ms, es, ex, tx)

	// setting up the controllers
	user_controller := Controller.NewUserController(uuc, ts)

	// setting up the router
	router := Router.NewRouter(user_controller)
	router.Run()
}
