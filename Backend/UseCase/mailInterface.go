package UseCase

type IMailService interface {
	SendVerificationEmail(to, token, api string) error
	SendPasswordResetEmail(to, resetToken, api string) error
}
