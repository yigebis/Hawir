package Infrastructure

import (
	"Hawir/UseCase"

	"fmt"

	"gopkg.in/gomail.v2"
)

type MailService struct {
	Sender            string //eg. yigerem4@gmail.com
	Password          string
	From              string //eg. Hawir.com
	WebsiteDomainName string
}

func NewMailService(sender, password, from, websiteDomainName string) UseCase.IMailService {
	return &MailService{
		Sender:            sender,
		Password:          password,
		From:              from,
		WebsiteDomainName: websiteDomainName,
	}
}

func (ms *MailService) SendVerificationEmail(to, token string) error {
	m := gomail.NewMessage()

	m.SetHeader("From", ms.From)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Verify your Email")

	bodyMessage := "Please follow this link to verify your email\n"
	bodyLink := fmt.Sprintf(ms.WebsiteDomainName+"/verify?email=%s&token=%s", to, token)
	body := bodyMessage + bodyLink
	m.SetBody("text/plain", body)

	host := "smtp.gmail.com"
	port := 587

	d := gomail.NewDialer(host, port, ms.Sender, ms.Password)

	err := d.DialAndSend(m)
	fmt.Println(err)
	return err
}

func (ms *MailService) SendPasswordResetEmail(to, resetToken string) error {
	return nil
}
