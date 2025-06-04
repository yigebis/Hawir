package main

import (
	"Hawir/Delivery/Controller"
	"Hawir/Delivery/Router"
	"Hawir/Error"
	"Hawir/Infrastructure"
	"Hawir/Repository"
	"Hawir/UseCase"
	"strconv"

	"context"
	"fmt"
	"log"
	"os"

	// comment it for production
	"github.com/joho/godotenv"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	//comment it for production
	if err := godotenv.Load(); err != nil {
		log.Fatal("error loading .env file")
	}

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
	admin_collection := client.Database("Hawir").Collection("Admins")
	user_collection := client.Database("Hawir").Collection("users")
	travel_collection := client.Database("Hawir").Collection("travels")
	travel_stat_collection := client.Database("Hawir").Collection("travel_stats")
	seat_collection := client.Database("Hawir").Collection("seats")
	agency_collection := client.Database("Hawir").Collection("agencies")
	booking_collection := client.Database("Hawir").Collection("Booking")
	agency_admin_collection := client.Database("Hawir").Collection("AgencyAdmins")
	destination_collection := client.Database("Hawir").Collection("destinations")
	destination_details_collection := client.Database("Hawir").Collection("destination_details")
	bus_collection := client.Database("Hawir").Collection("buses")
	driver_collection := client.Database("Hawir").Collection("Drivers")
	event_collection := client.Database("Hawir").Collection("events")
	code_collection := client.Database("Hawir").Collection("codes")
	bus_tracking_collection := client.Database("Hawir").Collection("bus_tracking")
	ads_collection := client.Database("Hawir").Collection("Advertisements")

	admin_context := context.TODO()
	user_context := context.TODO()
	travel_context := context.TODO()
	agency_context := context.TODO()
	booking_context := context.TODO()
	destination_context := context.TODO()
	driver_context := context.TODO()
	event_context := context.TODO()
	code_context := context.TODO()
	bus_tracking_context := context.TODO()
	ads_context := context.TODO()

	admr := Repository.NewAdminRepository(admin_context, admin_collection)
	ur := Repository.NewUserRepository(user_context, user_collection)
	agr := Repository.NewAgencyRepository(agency_context, agency_collection, agency_admin_collection, bus_collection)
	tr := Repository.NewTravelRepository(travel_context, travel_collection)
	tsr := Repository.NewTravelStatsRepo(travel_context, travel_stat_collection)
	br := Repository.NewBookingRepository(
		booking_context,
		booking_collection,
		travel_stat_collection,
		seat_collection,
	)
	dr := Repository.NewDestinationRepository(destination_context, destination_collection, destination_details_collection)
	drr := Repository.NewDriverRepository(driver_context, driver_collection)
	er := Repository.NewEventRepository(event_context, event_collection)
	cr := Repository.NewCodeRepository(code_context, code_collection)
	btr := Repository.NewBusTrackingRepository(bus_tracking_collection, bus_tracking_context)
	adr := Repository.NewAdvertisementRepository(ads_collection, ads_context)

	jwtSecret := os.Getenv("JWT_SECRET")
	es := Error.NewErrorService()
	ps := Infrastructure.NewPasswordService(es)
	ts := Infrastructure.NewTokenService(jwtSecret)
	timeService := Infrastructure.NewTimeService()
	ms := Infrastructure.NewMailService(os.Getenv("SENDER_EMAIL"), os.Getenv("EMAIL_PASSWORD"), os.Getenv("FROM"), websiteDomainName)
	vs := Infrastructure.NewValidationService(es)

	cloudinaryUrl := os.Getenv("CLOUDINARY_STRING")
	advPublicID := os.Getenv("CLOUDINARY_ADVERTISEMENT_PUBLIC_ID")
	travelerPublicID := os.Getenv("CLOUDINARY_TRAVELER_PUBLIC_ID")
	driverPublicID := os.Getenv("CLOUDINARY_DRIVER_PUBLIC_ID")
	agencyPublicID := os.Getenv("CLOUDINARY_AGENCY_PUBLIC_ID")
	eventPublicID := os.Getenv("CLOUDINARY_EVENT_PUBLIC_ID")
	destinationPublicID := os.Getenv("CLOUDINARY_DESTINATION_PUBLIC_ID")
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")

	cs := Infrastructure.NewCloudinaryService(cloudinaryUrl, cloudName, advPublicID, travelerPublicID, eventPublicID, agencyPublicID, destinationPublicID, driverPublicID)

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

	uuc := UseCase.NewUserUseCase(ur, cr, ps, ts, ms, es, cs, ex, tx, rx)
	aguc := UseCase.NewAgencyUseCase(agr, drr, cr, ps, ts, es, ms, cs, ex, tx, rx)
	tuc := UseCase.NewTravelUseCase(tr, tsr, agr, drr, es)
	auc := UseCase.NewAdminUseCase(admr, agr, ps, es, ts, ms, tx, rx)
	buc := UseCase.NewBookingUseCase(br, tr, es)
	duc := UseCase.NewDestinationUseCase(dr, es)
	druc := UseCase.NewDriverUseCase(drr, es, ps, ts, ms, tx, rx)
	euc := UseCase.NewEventUseCase(er, dr, es, cs)
	btuc := UseCase.NewBusTrackingUseCase(btr, es)
	aduc := UseCase.NewAdvertisementUseCase(adr, es)

	// setting up the controllers
	user_controller := Controller.NewUserController(uuc, aguc, ts, oauthService, ps, vs, rx, websiteDomainName)
	agency_controller := Controller.NewAgencyController(aguc, ts, ps, vs, rx, websiteDomainName)
	travel_controller := Controller.NewTravelController(tuc)
	admin_controller := Controller.NewAdminController(auc, aguc, vs, rx, websiteDomainName)
	booking_controller := Controller.NewBookingController(buc)
	destination_controller := Controller.NewDestinationController(duc, cs)
	driver_controller := Controller.NewDriverController(druc, vs, cs, rx, websiteDomainName)

	hub := Infrastructure.NewHub()
	go hub.Run()
	bus_tracking_controller := Controller.NewBusTrackingController(hub, btuc)

	maxPageSize, _ := strconv.Atoi(os.Getenv("MAX_SIZE_PER_PAGE"))
	event_controller := Controller.NewEventController(euc, maxPageSize)

	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")
	cloudinaryName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	advertisement_controller := Controller.NewAdvertisementController(aduc, apiKey, apiSecret, cloudinaryName, cs)

	// setting up the router
	router := Router.NewRouter(user_controller, agency_controller, travel_controller, admin_controller, booking_controller, destination_controller, driver_controller, event_controller, bus_tracking_controller, advertisement_controller, jwtSecret)
	router.Run()
}
