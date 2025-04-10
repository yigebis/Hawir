package Infrastructure

import (
	"Hawir/UseCase"

	"context"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryService struct{}

func NewCloudinaryService() UseCase.ICloudService {
	return &CloudinaryService{}
}

func (cs *CloudinaryService) UploadToCloudinary(fileHeader *multipart.FileHeader) (string, error) {
	url := os.Getenv("CLOUDINARY_STRING")
	cld, err := cloudinary.NewFromURL(url)
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
