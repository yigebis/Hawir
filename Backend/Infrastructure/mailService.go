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

func (ms *MailService) SendVerificationEmail(to, token, api string) error {
	m := gomail.NewMessage()

	m.SetHeader("From", ms.From)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Verify your Email")

	verifyLink := fmt.Sprintf(ms.WebsiteDomainName+api+"/verify?email=%s&token=%s", to, token)
	rejectLink := fmt.Sprintf(ms.WebsiteDomainName+api+"/reject?email=%s&token=%s", to, token)

	body := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<style>
			.button {
				display: inline-block;
				padding: 10px 20px;
				font-size: 16px;
				color: #fff;  /* Set text color to white */
				background-color: #007BFF;  /* Verify button color */
				border: none;
				border-radius: 5px;
				text-decoration: none;  /* Remove underline */
				margin: 5px;
				cursor: pointer;
			}
			.button.reject {
				background-color: #dc3545;  /* Reject button color */
			}
		</style>
	</head>
	<body>
		<p>Please verify your email by clicking the button below:</p>
		<a style="color: #fff; text-decoration: none; font-weight: bold;" href="%s" class="button">Verify Email</a>
		<br><br>
		<p>If you did not request this, you can reject the verification by clicking the button below:</p>
		<a style="color: #fff; text-decoration: none; font-weight: bold;" href="%s" class="button reject">Reject Email</a>
	</body>
	</html>
	`, verifyLink, rejectLink)

	m.SetBody("text/html", body)

	host := "smtp.gmail.com"
	port := 587

	d := gomail.NewDialer(host, port, ms.Sender, ms.Password)

	err := d.DialAndSend(m)
	fmt.Println(err)
	return err
}

func (ms *MailService) SendPasswordResetEmail(to, resetToken, api string) error {
	return nil
}
