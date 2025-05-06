package Domain

type Admin struct {
	Email     string `json:"email" bson:"email" validate:"required,email"`
	Password  string `json:"password" bson:"password" validate:"required,min=8,max=20"`
	Password2 string `json:"password2" bson:"password2" validate:"required,min=8,max=20"`
}
