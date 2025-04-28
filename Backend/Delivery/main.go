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
	// "os"

	// comment it for production
	"github.com/joho/godotenv"

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

	// fmt.Print(uri)

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
	travel_collection := client.Database("Hawir").Collection("travels")
	travel_stat_collection := client.Database("Hawir").Collection("travel_stats")
	seat_collection := client.Database("Hawir").Collection("seats")
	agency_collection := client.Database("Hawir").Collection("agencies")
	booking_collection := client.Database("Hawir").Collection("Booking")
	admin_collection := client.Database("Hawir").Collection("Admins")
	destination_collection := client.Database("Hawir").Collection("destinations")
	bus_collection := client.Database("Hawir").Collection("buses")
	driver_collection := client.Database("Hawir").Collection("Drivers")

	user_context := context.TODO()
	travel_context := context.TODO()
	agency_context := context.TODO()
	booking_context := context.TODO()
	destination_context := context.TODO()
	driver_context := context.TODO()

	ur := Repository.NewUserRepository(user_context, user_collection)
	agr := Repository.NewAgencyRepository(agency_context, agency_collection, admin_collection, bus_collection)
	tr := Repository.NewTravelRepository(travel_context, travel_collection)
	tsr := Repository.NewTravelStatsRepo(travel_context, travel_stat_collection)
	br := Repository.NewBookingRepository(
		booking_context,
		booking_collection,
		travel_stat_collection,
		seat_collection,
		user_collection,
	)
	dr := Repository.NewDestinationRepository(destination_context, destination_collection)
	drr := Repository.NewDriverRepository(driver_context, driver_collection)

	jwtSecret := os.Getenv("JWT_SECRET")
	es := Error.NewErrorService()
	ps := Infrastructure.NewPasswordService(es)
	ts := Infrastructure.NewTokenService(jwtSecret)
	timeService := Infrastructure.NewTimeService()
	ms := Infrastructure.NewMailService(os.Getenv("SENDER_EMAIL"), os.Getenv("EMAIL_PASSWORD"), os.Getenv("FROM"), websiteDomainName)
	vs := Infrastructure.NewValidationService(es)
	cs := Infrastructure.NewCloudinaryService()

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

	uuc := UseCase.NewUserUseCase(ur, ps, ts, ms, es, cs, ex, tx, rx)
	aguc := UseCase.NewAgencyUseCase(agr, drr, ps, ts, es, ms, ex, tx, rx)
	tuc := UseCase.NewTravelUseCase(tr, tsr, agr, drr, es)
	auc := UseCase.NewAdminUseCase(agr, ps, es)
	buc := UseCase.NewBookingUseCase(br, tr, es)
	duc := UseCase.NewDestinationUseCase(dr, es)
	druc := UseCase.NewDriverUseCase(drr, es, ps, ts, ms, tx, rx)

	// setting up the controllers
	user_controller := Controller.NewUserController(uuc, aguc, ts, oauthService, ps, vs, rx, websiteDomainName)
	agency_controller := Controller.NewAgencyController(aguc, ts, ps, vs, rx, websiteDomainName)
	travel_controller := Controller.NewTravelController(tuc)
	admin_controller := Controller.NewAdminController(auc, aguc, vs)
	booking_controller := Controller.NewBookingController(buc)
	destination_controller := Controller.NewDestinationController(duc)
	driver_controller := Controller.NewDriverController(druc, vs, rx, websiteDomainName)

	// setting up the router
	router := Router.NewRouter(user_controller, agency_controller, travel_controller, admin_controller, booking_controller, destination_controller, driver_controller, jwtSecret)
	router.Run()
}
