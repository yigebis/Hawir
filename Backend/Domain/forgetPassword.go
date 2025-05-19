package Domain

type ForgetPassword struct {
	Email       string `json:"email" bson:"email" validate:"required,email"`
	Code        string `json:"code" bson:"code" validate:"required"`
	NewPassword string `json:"new_password" bson:"new_password" validate:"required"`
}

type CodeData struct {
	Email string `json:"email" bson:"email"`
	Code  string `json:"code" bson:"code"`
}
