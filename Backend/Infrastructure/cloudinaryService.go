package Infrastructure

import (
	"Hawir/UseCase"
	"path/filepath"
	"strings"

	"context"
	"mime/multipart"

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
	CloudinaryUrl string
}

func NewCloudinaryService(url string) UseCase.ICloudService {
	return &CloudinaryService{
		CloudinaryUrl: url,
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
