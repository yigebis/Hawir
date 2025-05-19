package UseCase

type IMailService interface {
	SendVerificationEmail(to, token, api string) error
	SendPasswordResetEmail(to, code string) error
	SendAgencyAdminPassword(to, uniqueID, password string) error
}
