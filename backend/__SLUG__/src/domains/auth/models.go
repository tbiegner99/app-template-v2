package auth

type UserRole struct {
	Name      string
	ContextId string
}

// User represents the business model for a user
type User struct {
	ID       string
	Email    string
	Name     string
	Roles    []UserRole
	Metadata map[string]interface{}
}

// ApplicationUser is the application-owned user record in the users table.
type ApplicationUser struct {
	ID            string
	SupertokensID string
	Email         string
	DisplayName   string
	IsDisabled    bool
	Roles         []string
	DateCreated   string
	LastModified  string
}

// ChangePasswordRequest holds the old and new passwords for a password change.
type ChangePasswordRequest struct {
	OldPassword string
	NewPassword string
}

// Session represents an authenticated session
type Session struct {
	UserID        string
	SessionHandle string
	AccessToken   string
	RefreshToken  string
}

// SignUpRequest represents a sign up request
type SignUpRequest struct {
	Email    string
	Password string
}

// SignInRequest represents a sign in request
type SignInRequest struct {
	Email    string
	Password string
}
