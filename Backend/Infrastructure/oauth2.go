package Infrastructure

import (
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type OAuth struct {
	OAuthState        string
	OAuthConfig       *oauth2.Config
	WebsiteDomainName string
}

func NewOAuth(oauthState string, oauthClientID string, oauthClientSecret string, websiteDomainName string) *OAuth {

	return &OAuth{
		OAuthState:        oauthState,
		WebsiteDomainName: websiteDomainName,
		OAuthConfig: &oauth2.Config{
			ClientID:     oauthClientID,                        // Replace with your Client ID
			ClientSecret: oauthClientSecret,                    // Replace with your Client Secret
			RedirectURL:  websiteDomainName + "/auth/callback", // Replace with your redirect URI
			Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"},
			Endpoint:     google.Endpoint,
		},
	}
}

func (o *OAuth) GetOAuthURL() string {
	return o.OAuthConfig.AuthCodeURL(o.OAuthState, oauth2.AccessTypeOffline)
}
