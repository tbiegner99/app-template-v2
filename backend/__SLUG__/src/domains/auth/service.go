package auth

import (
	"context"

	"go_backend/src/shared/pagination"
)

type authDatasource interface {
	SignUp(email, password string) (string, error)
	SignIn(email, password string) (string, error)
	GetUser(userID string) (*User, error)
	CreateApplicationUser(ctx context.Context, supertokensID, email, displayName string, roles []string) (*ApplicationUser, error)
	GetApplicationUserBySupertokensID(ctx context.Context, supertokensID string) (*ApplicationUser, error)
	ChangePassword(ctx context.Context, email, oldPassword, newPassword string) error
	ListUsers(ctx context.Context, p pagination.ResolvedParams) (pagination.PagedResponse[ApplicationUser], error)
	GetRolesForUser(ctx context.Context, supertokensID string) ([]string, error)
	GetApplicationUserByID(ctx context.Context, id string) (*ApplicationUser, error)
	UpdateUser(ctx context.Context, id, email, displayName string, roles []string) (*ApplicationUser, error)
	AdminResetPassword(ctx context.Context, userID, newPassword string) error
	DisableUser(ctx context.Context, id string) error
	EnableUser(ctx context.Context, id string) error
	DeleteSupertokensUser(supertokensID string)
}

// Service contains business logic for the auth domain.
type Service struct {
	datasource authDatasource
}

// NewService creates a new service instance.
func NewService(datasource authDatasource) *Service {
	return &Service{datasource: datasource}
}

// SignUp creates a SuperTokens user then creates the application users row.
// If the application insert fails, the SuperTokens user is deleted to keep them in sync.
func (s *Service) SignUp(ctx context.Context, req *SignUpRequest, displayName string, roles []string) (*ApplicationUser, error) {
	supertokensID, err := s.datasource.SignUp(req.Email, req.Password)
	if err != nil {
		return nil, err
	}
	appUser, err := s.datasource.CreateApplicationUser(ctx, supertokensID, req.Email, displayName, roles)
	if err != nil {
		s.datasource.DeleteSupertokensUser(supertokensID)
		return nil, err
	}
	return appUser, nil
}

// SignIn authenticates via SuperTokens; returns error if user is disabled.
func (s *Service) SignIn(ctx context.Context, req *SignInRequest) (string, error) {
	supertokensID, err := s.datasource.SignIn(req.Email, req.Password)
	if err != nil {
		return "", err
	}
	appUser, err := s.datasource.GetApplicationUserBySupertokensID(ctx, supertokensID)
	if err != nil {
		// Only mask the expected "no app-side row" case as wrong credentials
		// (don't leak whether a SuperTokens identity exists). Any other error
		// (DB down, schema mismatch, etc.) propagates so it gets logged as a
		// real error instead of silently looking like a bad password.
		if _, ok := err.(*UserNotFoundError); ok {
			return "", &WrongCredentialsError{}
		}
		return "", err
	}
	if appUser.IsDisabled {
		return "", &WrongCredentialsError{}
	}
	return supertokensID, nil
}

// ResolveApplicationUser resolves a SuperTokens user ID to the application user.
func (s *Service) ResolveApplicationUser(ctx context.Context, supertokensID string) (*ApplicationUser, error) {
	return s.datasource.GetApplicationUserBySupertokensID(ctx, supertokensID)
}

// GetUser retrieves SuperTokens user info (used for /me endpoint).
func (s *Service) GetUser(userID string) (*User, error) {
	return s.datasource.GetUser(userID)
}

// ChangePassword verifies the old password then updates to the new one.
func (s *Service) ChangePassword(ctx context.Context, email, oldPassword, newPassword string) error {
	return s.datasource.ChangePassword(ctx, email, oldPassword, newPassword)
}

// ListUsers returns a paged list of users enriched with their roles.
func (s *Service) ListUsers(ctx context.Context, params pagination.Params) (pagination.PagedResponse[ApplicationUser], error) {
	resolved, err := pagination.Resolve(params, userColumnMap)
	if err != nil {
		return pagination.PagedResponse[ApplicationUser]{}, err
	}
	result, err := s.datasource.ListUsers(ctx, resolved)
	if err != nil {
		return pagination.PagedResponse[ApplicationUser]{}, err
	}
	for i, u := range result.Data {
		roles, err := s.datasource.GetRolesForUser(ctx, u.SupertokensID)
		if err != nil {
			return pagination.PagedResponse[ApplicationUser]{}, err
		}
		result.Data[i].Roles = roles
	}
	return result, nil
}

// UpdateUser updates a user's email, display name, and roles.
func (s *Service) UpdateUser(ctx context.Context, id, email, displayName string, roles []string) (*ApplicationUser, error) {
	return s.datasource.UpdateUser(ctx, id, email, displayName, roles)
}

// AdminResetPassword resets a user's password without requiring the old password.
func (s *Service) AdminResetPassword(ctx context.Context, userID, newPassword string) error {
	appUser, err := s.datasource.GetApplicationUserByID(ctx, userID)
	if err != nil {
		return err
	}
	return s.datasource.AdminResetPassword(ctx, appUser.SupertokensID, newPassword)
}

// DisableUser disables an account, blocking the self-disable case.
func (s *Service) DisableUser(ctx context.Context, adminSupertokensID, targetID string) error {
	target, err := s.datasource.GetApplicationUserByID(ctx, targetID)
	if err != nil {
		return err
	}
	if adminSupertokensID == target.SupertokensID {
		return &SelfDisableError{}
	}
	return s.datasource.DisableUser(ctx, targetID)
}

// EnableUser re-enables a disabled account.
func (s *Service) EnableUser(ctx context.Context, id string) error {
	return s.datasource.EnableUser(ctx, id)
}
