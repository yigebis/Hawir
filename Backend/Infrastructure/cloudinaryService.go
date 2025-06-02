package Infrastructure

import (
	"Hawir/UseCase"
	"fmt"
	"path/filepath"
	"strings"

	"context"
	"mime/multipart"

	"crypto/hmac"
	"crypto/sha1"
	"encoding/hex"
	"sort"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// helper funtions
func ExtractPublicID(cloudinaryURL string) string {
	// Split by '/' and get the last two segments (folder + filename)
	parts := strings.Split(cloudinaryURL, "/")
	if len(parts) < 2 {
		return ""
	}

	// Get filename with extension
	filename := parts[len(parts)-1] // skqf5r01gljud7tinsmz.jpg

	// Remove extension
	publicID := strings.TrimSuffix(filename, filepath.Ext(filename))

	// Get folder (like "profile_photos")
	folder := parts[len(parts)-2]

	return folder + "/" + publicID
}

type CloudinaryService struct {
	CloudinaryUrl         string
	CloudName             string
	AdvertisementPublicID string
	TravelerPublicID      string
	EventPublicID         string
	AgencyPublicID        string
	DestinationPublicID   string
	DriverPublicID        string
}

func NewCloudinaryService(url, cloudName, advertisementPID, travelerPID, eventPID, agencyPID, destinationPID, driverPID string) UseCase.ICloudService {
	return &CloudinaryService{
		CloudinaryUrl:         url,
		CloudName:             cloudName,
		AdvertisementPublicID: advertisementPID,
		TravelerPublicID:      travelerPID,
		EventPublicID:         eventPID,
		AgencyPublicID:        agencyPID,
		DestinationPublicID:   destinationPID,
		DriverPublicID:        driverPID,
	}
}

func (cs *CloudinaryService) UploadProfileToCloud(fileHeader *multipart.FileHeader) (string, error) {
	cld, err := cloudinary.NewFromURL(cs.CloudinaryUrl)
	if err != nil {
		return "", err
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	resp, err := cld.Upload.Upload(context.Background(), file, uploader.UploadParams{
		Folder: "profile_photos",
	})
	if err != nil {
		return "", err
	}

	return resp.SecureURL, nil
}

func (cs *CloudinaryService) UploadEventMediaToCloud(fileHeader *multipart.FileHeader) (string, error) {
	cld, err := cloudinary.NewFromURL(cs.CloudinaryUrl)
	if err != nil {
		return "", err
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	resp, err := cld.Upload.Upload(context.Background(), file, uploader.UploadParams{
		Folder: "event_media",
	})
	if err != nil {
		return "", err
	}

	return resp.SecureURL, nil
}

func (cs *CloudinaryService) DeleteFromCloud(url string) error {
	publicID := ExtractPublicID(url)
	if publicID == "" {
		return nil // or return an error if you prefer
	}

	cld, err := cloudinary.NewFromURL(cs.CloudinaryUrl)
	if err != nil {
		return err
	}

	_, err = cld.Upload.Destroy(context.Background(), uploader.DestroyParams{
		PublicID: publicID,
	})
	if err != nil {
		return err
	}

	return nil
}

func (cs *CloudinaryService) GenerateCloudinarySignature(params map[string]string, apiSecret string) string {
	var keys []string
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var toSign []string
	for _, k := range keys {
		toSign = append(toSign, k+"="+params[k])
	}
	joined := strings.Join(toSign, "&")
	fmt.Println(joined)

	h := hmac.New(sha1.New, []byte(apiSecret))
	h.Write([]byte(joined))
	return hex.EncodeToString(h.Sum(nil))
}

func (cs *CloudinaryService) GetAdvertisementPublicID() (string, string) {
	return cs.CloudName, cs.AdvertisementPublicID
}

func (cs *CloudinaryService) GetTravelerPublicID() (string, string) {
	return cs.CloudName, cs.TravelerPublicID
}

func (cs *CloudinaryService) GetEventPublicID() (string, string) {
	return cs.CloudName, cs.EventPublicID
}

func (cs *CloudinaryService) GetAgencyPublicID() (string, string) {
	return cs.CloudName, cs.AgencyPublicID
}

func (cs *CloudinaryService) GetDestinationPublicID() (string, string) {
	return cs.CloudName, cs.DestinationPublicID
}

func (cs *CloudinaryService) GetDriverPublicID() (string, string) {
	return cs.CloudName, cs.DriverPublicID
}
