package Controller

import (
	"fmt"
	"mime/multipart"
	"net/http"

	"github.com/dgrijalva/jwt-go"
)

const maxImageSize = 5 << 20  // 5 MB
const maxVideoSize = 50 << 20 // 50 MB
var allowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	// "image/gif":  true,
	"image/jpg":  true,
	"image/jfif": true,
}

var allowedVideoTypes = map[string]bool{
	"video/mp4":  true,
	"video/webm": true,
	"video/ogg":  true,
	"video/avi":  true,
	"video/mpeg": true,
}

// helper functions
func checkPhotoFile(fileHeader *multipart.FileHeader) string {
	if fileHeader.Size > maxImageSize {
		return fmt.Sprintf("file too large (max size: %d bytes)", maxImageSize)
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "unable to open file"
	}
	defer file.Close()

	// Read first 512 bytes to detect content type
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		return "unable to read file"
	}

	// Check MIME type
	contentType := http.DetectContentType(buffer)
	if !allowedImageTypes[contentType] {
		return "only image files (jpeg, png, gif) are allowed"
	}

	return ""
}

func checkAnyFile(fileHeader *multipart.FileHeader) string {
	if fileHeader.Size > maxVideoSize {
		return fmt.Sprintf("file too large (max size: %d bytes)", maxImageSize)
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "unable to open file"
	}
	defer file.Close()

	// Read first 512 bytes to detect content type
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		return "unable to read file"
	}

	// Check MIME type
	contentType := http.DetectContentType(buffer)
	fmt.Println("Content Type:", contentType)
	if !allowedVideoTypes[contentType] && !allowedImageTypes[contentType] {
		return "only image files (jpeg, png, gif) are allowed"
	}

	return ""
}

func getClaims(claimsAny any, exists bool) jwt.MapClaims {
	if !exists {
		return nil
	}
	// claims := claimsAny.(map[string]interface{})
	return claimsAny.(jwt.MapClaims)
}
