package auth

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/supertokens/supertokens-golang/recipe/emailpassword"
	epmodels "github.com/supertokens/supertokens-golang/recipe/emailpassword/epmodels"
	"github.com/supertokens/supertokens-golang/recipe/session"
	"github.com/supertokens/supertokens-golang/recipe/userroles"
	userrolesmodels "github.com/supertokens/supertokens-golang/recipe/userroles/userrolesmodels"
	"github.com/supertokens/supertokens-golang/supertokens"
	"go_backend/src/logger"
	"go_backend/src/shared/pagination"
)

// userColumnMap maps API field names to DB column names for users.
var userColumnMap = map[string]string{
	"displayName": "display_name",
	"email":       "email",
	"isDisabled":  "is_disabled",
	"dateCreated": "date_created",
}

type emailPasswordAPI interface {
	SignUp(tenantID, email, password string) (epmodels.SignUpResponse, error)
	SignIn(tenantID, email, password string) (epmodels.SignInResponse, error)
	GetUserByID(userID string) (*epmodels.User, error)
	UpdateEmailOrPassword(userID string, email, password *string, applyPasswordPolicy *bool, tenantIDForPasswordPolicy *string) (epmodels.UpdateEmailOrPasswordResponse, error)
}

type sessionAPI interface {
	RevokeAllSessionsForUser(userID string, tenantID *string) ([]string, error)
}

type userRolesAPI interface {
	AddRoleToUser(tenantID, userID, role string) (userrolesmodels.AddRoleToUserResponse, error)
	GetRolesForUser(tenantID, userID string) (userrolesmodels.GetRolesForUserResponse, error)
	RemoveUserRole(tenantID, userID, role string) (userrolesmodels.RemoveUserRoleResponse, error)
}

type supertokensAPI interface {
	DeleteUser(userID string) error
}

type realEP struct{}

func (r *realEP) SignUp(tenantID, email, password string) (epmodels.SignUpResponse, error) {
	return emailpassword.SignUp(tenantID, email, password)
}
func (r *realEP) SignIn(tenantID, email, password string) (epmodels.SignInResponse, error) {
	return emailpassword.SignIn(tenantID, email, password)
}
func (r *realEP) GetUserByID(userID string) (*epmodels.User, error) {
	return emailpassword.GetUserByID(userID)
}
func (r *realEP) UpdateEmailOrPassword(userID string, email, password *string, apply *bool, tenantID *string) (epmodels.UpdateEmailOrPasswordResponse, error) {
	return emailpassword.UpdateEmailOrPassword(userID, email, password, apply, tenantID)
}

type realSession struct{}

func (r *realSession) RevokeAllSessionsForUser(userID string, tenantID *string) ([]string, error) {
	return session.RevokeAllSessionsForUser(userID, tenantID)
}

type realUserRoles struct{}

func (r *realUserRoles) AddRoleToUser(tenantID, userID, role string) (userrolesmodels.AddRoleToUserResponse, error) {
	return userroles.AddRoleToUser(tenantID, userID, role)
}
func (r *realUserRoles) GetRolesForUser(tenantID, userID string) (userrolesmodels.GetRolesForUserResponse, error) {
	return userroles.GetRolesForUser(tenantID, userID)
}
func (r *realUserRoles) RemoveUserRole(tenantID, userID, role string) (userrolesmodels.RemoveUserRoleResponse, error) {
	return userroles.RemoveUserRole(tenantID, userID, role)
}

type realST struct{}

func (r *realST) DeleteUser(userID string) error { return supertokens.DeleteUser(userID) }

// Datasource handles auth interactions: SuperTokens for credentials, postgres for application users.
type Datasource struct {
	db    logger.Database
	ep    emailPasswordAPI
	sess  sessionAPI
	roles userRolesAPI
	st    supertokensAPI
}

// NewDatasource creates a new datasource instance.
func NewDatasource(db logger.Database) *Datasource {
	return &Datasource{
		db:    db,
		ep:    &realEP{},
		sess:  &realSession{},
		roles: &realUserRoles{},
		st:    &realST{},
	}
}

// SignUp creates a new user via SuperTokens.
func (ds *Datasource) SignUp(email, password string) (string, error) {
	resp, err := ds.ep.SignUp("public", email, password)
	if err != nil {
		return "", err
	}
	if resp.EmailAlreadyExistsError != nil {
		return "", &EmailAlreadyExistsError{}
	}
	return resp.OK.User.ID, nil
}

// SignIn authenticates a user via SuperTokens.
func (ds *Datasource) SignIn(email, password string) (string, error) {
	resp, err := ds.ep.SignIn("public", email, password)
	if err != nil {
		return "", err
	}
	if resp.WrongCredentialsError != nil {
		return "", &WrongCredentialsError{}
	}
	return resp.OK.User.ID, nil
}

// GetUser retrieves SuperTokens user information.
func (ds *Datasource) GetUser(userID string) (*User, error) {
	userInfo, err := ds.ep.GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	if userInfo == nil {
		return nil, &UserNotFoundError{}
	}
	return &User{
		ID:    userInfo.ID,
		Email: userInfo.Email,
		Name:  userInfo.Email,
		Roles: []UserRole{{Name: "admin"}},
	}, nil
}

// CreateApplicationUser inserts a new row into the users table and assigns roles.
func (ds *Datasource) CreateApplicationUser(ctx context.Context, supertokensID, email, displayName string, roles []string) (*ApplicationUser, error) {
	now := time.Now().UTC().Format(time.RFC3339)
	id := uuid.New().String()
	_, err := ds.db.ExecContext(ctx,
		`INSERT INTO users (id, supertokens_id, email, display_name, date_created, last_modified)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		id, supertokensID, email, displayName, now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("insert application user: %w", err)
	}
	for _, role := range roles {
		if _, err := ds.roles.AddRoleToUser("public", supertokensID, role); err != nil {
			return nil, fmt.Errorf("add role %s: %w", role, err)
		}
	}
	return &ApplicationUser{
		ID:            id,
		SupertokensID: supertokensID,
		Email:         email,
		DisplayName:   displayName,
		IsDisabled:    false,
		Roles:         roles,
		DateCreated:   now,
		LastModified:  now,
	}, nil
}

// GetApplicationUserBySupertokensID looks up the application user by SuperTokens user ID.
func (ds *Datasource) GetApplicationUserBySupertokensID(ctx context.Context, supertokensID string) (*ApplicationUser, error) {
	row := ds.db.QueryRowContext(ctx,
		`SELECT id, supertokens_id, email, display_name, is_disabled, date_created, last_modified
		 FROM users WHERE supertokens_id = $1`, supertokensID)
	u := &ApplicationUser{}
	if err := row.Scan(&u.ID, &u.SupertokensID, &u.Email, &u.DisplayName, &u.IsDisabled, &u.DateCreated, &u.LastModified); err != nil {
		if err == sql.ErrNoRows {
			return nil, &UserNotFoundError{}
		}
		return nil, fmt.Errorf("get application user: %w", err)
	}
	return u, nil
}

// ChangePassword verifies the old password then updates it via SuperTokens.
func (ds *Datasource) ChangePassword(ctx context.Context, email, oldPassword, newPassword string) error {
	// Verify old password
	signInResp, err := ds.ep.SignIn("public", email, oldPassword)
	if err != nil {
		return err
	}
	if signInResp.WrongCredentialsError != nil {
		return &WrongCredentialsError{}
	}
	userID := signInResp.OK.User.ID
	// Update password
	updateResp, err := ds.ep.UpdateEmailOrPassword(userID, nil, &newPassword, nil, nil)
	if err != nil {
		return fmt.Errorf("update password: %w", err)
	}
	if updateResp.UnknownUserIdError != nil {
		return &UserNotFoundError{}
	}
	return nil
}

// ListUsers returns a paged list of application users matching the given params.
func (ds *Datasource) ListUsers(ctx context.Context, p pagination.ResolvedParams) (pagination.PagedResponse[ApplicationUser], error) {
	var args []interface{}
	argIdx := 1

	// WHERE clause
	var conditions []string
	for _, f := range p.Filters {
		switch f.Op {
		case pagination.OpEq:
			conditions = append(conditions, fmt.Sprintf("%s = $%d", f.Column, argIdx))
			args = append(args, f.Value)
			argIdx++
		case pagination.OpContains:
			conditions = append(conditions, fmt.Sprintf("%s ILIKE $%d", f.Column, argIdx))
			args = append(args, "%"+f.Value+"%")
			argIdx++
		case pagination.OpGt:
			conditions = append(conditions, fmt.Sprintf("%s > $%d", f.Column, argIdx))
			args = append(args, f.Value)
			argIdx++
		case pagination.OpGte:
			conditions = append(conditions, fmt.Sprintf("%s >= $%d", f.Column, argIdx))
			args = append(args, f.Value)
			argIdx++
		case pagination.OpLt:
			conditions = append(conditions, fmt.Sprintf("%s < $%d", f.Column, argIdx))
			args = append(args, f.Value)
			argIdx++
		case pagination.OpLte:
			conditions = append(conditions, fmt.Sprintf("%s <= $%d", f.Column, argIdx))
			args = append(args, f.Value)
			argIdx++
		}
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	// ORDER BY
	sortCol := "display_name"
	if p.Sort != "" {
		sortCol = p.Sort
	}
	orderBy := fmt.Sprintf("ORDER BY %s %s", sortCol, strings.ToUpper(string(p.SortDir)))

	// COUNT
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM users %s`, where)
	var total int
	if err := ds.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return pagination.PagedResponse[ApplicationUser]{}, fmt.Errorf("count users: %w", err)
	}

	// DATA
	dataQuery := fmt.Sprintf(
		`SELECT id, supertokens_id, email, display_name, is_disabled, date_created, last_modified
		 FROM users %s %s LIMIT $%d OFFSET $%d`,
		where, orderBy, argIdx, argIdx+1,
	)
	args = append(args, p.PageSize, p.Offset())

	rows, err := ds.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return pagination.PagedResponse[ApplicationUser]{}, fmt.Errorf("list users: %w", err)
	}
	defer rows.Close()

	var users []ApplicationUser
	for rows.Next() {
		var u ApplicationUser
		if err := rows.Scan(&u.ID, &u.SupertokensID, &u.Email, &u.DisplayName, &u.IsDisabled, &u.DateCreated, &u.LastModified); err != nil {
			return pagination.PagedResponse[ApplicationUser]{}, fmt.Errorf("scan user: %w", err)
		}
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		return pagination.PagedResponse[ApplicationUser]{}, err
	}
	if users == nil {
		users = []ApplicationUser{}
	}
	return pagination.PagedResponse[ApplicationUser]{
		Data:     users,
		Total:    total,
		Page:     p.Page,
		PageSize: p.PageSize,
	}, nil
}

// GetRolesForUser returns the role names assigned to a SuperTokens user.
func (ds *Datasource) GetRolesForUser(ctx context.Context, supertokensID string) ([]string, error) {
	resp, err := ds.roles.GetRolesForUser("public", supertokensID)
	if err != nil {
		return nil, fmt.Errorf("get roles for user: %w", err)
	}
	return resp.OK.Roles, nil
}

// GetApplicationUserByID looks up an application user by their application ID.
func (ds *Datasource) GetApplicationUserByID(ctx context.Context, id string) (*ApplicationUser, error) {
	row := ds.db.QueryRowContext(ctx,
		`SELECT id, supertokens_id, email, display_name, is_disabled, date_created, last_modified
		 FROM users WHERE id = $1`, id)
	u := &ApplicationUser{}
	if err := row.Scan(&u.ID, &u.SupertokensID, &u.Email, &u.DisplayName, &u.IsDisabled, &u.DateCreated, &u.LastModified); err != nil {
		if err == sql.ErrNoRows {
			return nil, &UserNotFoundError{}
		}
		return nil, fmt.Errorf("get application user by id: %w", err)
	}
	return u, nil
}

// UpdateUser updates email, display_name, and roles for a user.
func (ds *Datasource) UpdateUser(ctx context.Context, id, email, displayName string, roles []string) (*ApplicationUser, error) {
	now := time.Now().UTC().Format(time.RFC3339)
	row := ds.db.QueryRowContext(ctx,
		`UPDATE users SET email = $1, display_name = $2, last_modified = $3
		 WHERE id = $4
		 RETURNING id, supertokens_id, email, display_name, is_disabled, date_created, last_modified`,
		email, displayName, now, id)
	u := &ApplicationUser{}
	if err := row.Scan(&u.ID, &u.SupertokensID, &u.Email, &u.DisplayName, &u.IsDisabled, &u.DateCreated, &u.LastModified); err != nil {
		if err == sql.ErrNoRows {
			return nil, &UserNotFoundError{}
		}
		return nil, fmt.Errorf("update user: %w", err)
	}

	// Diff roles
	currentResp, err := ds.roles.GetRolesForUser("public", u.SupertokensID)
	if err != nil {
		return nil, fmt.Errorf("get current roles: %w", err)
	}
	currentRoles := make(map[string]bool)
	for _, r := range currentResp.OK.Roles {
		currentRoles[r] = true
	}
	desiredRoles := make(map[string]bool)
	for _, r := range roles {
		desiredRoles[r] = true
	}
	for r := range desiredRoles {
		if !currentRoles[r] {
			if _, err := ds.roles.AddRoleToUser("public", u.SupertokensID, r); err != nil {
				return nil, fmt.Errorf("add role %s: %w", r, err)
			}
		}
	}
	for r := range currentRoles {
		if !desiredRoles[r] {
			if _, err := ds.roles.RemoveUserRole("public", u.SupertokensID, r); err != nil {
				return nil, fmt.Errorf("remove role %s: %w", r, err)
			}
		}
	}
	u.Roles = roles
	return u, nil
}

// AdminResetPassword resets a user's password without requiring the old password.
func (ds *Datasource) AdminResetPassword(ctx context.Context, supertokensID, newPassword string) error {
	resp, err := ds.ep.UpdateEmailOrPassword(supertokensID, nil, &newPassword, nil, nil)
	if err != nil {
		return fmt.Errorf("reset password: %w", err)
	}
	if resp.UnknownUserIdError != nil {
		return &UserNotFoundError{}
	}
	return nil
}

// DisableUser sets is_disabled=true and revokes all active sessions.
func (ds *Datasource) DisableUser(ctx context.Context, id string) error {
	now := time.Now().UTC().Format(time.RFC3339)
	row := ds.db.QueryRowContext(ctx,
		`UPDATE users SET is_disabled = true, last_modified = $1 WHERE id = $2 RETURNING supertokens_id`,
		now, id)
	var supertokensID string
	if err := row.Scan(&supertokensID); err != nil {
		if err == sql.ErrNoRows {
			return &UserNotFoundError{}
		}
		return fmt.Errorf("disable user: %w", err)
	}
	if _, err := ds.sess.RevokeAllSessionsForUser(supertokensID, nil); err != nil {
		return fmt.Errorf("revoke sessions: %w", err)
	}
	return nil
}

// EnableUser sets is_disabled=false.
func (ds *Datasource) EnableUser(ctx context.Context, id string) error {
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := ds.db.ExecContext(ctx,
		`UPDATE users SET is_disabled = false, last_modified = $1 WHERE id = $2`, now, id)
	if err != nil {
		return fmt.Errorf("enable user: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return &UserNotFoundError{}
	}
	return nil
}

// DeleteSupertokensUser removes a SuperTokens user (used for signup rollback).
func (ds *Datasource) DeleteSupertokensUser(supertokensID string) {
	// Best-effort cleanup — ignore error
	_ = ds.st.DeleteUser(supertokensID)
}

// Custom errors

type EmailAlreadyExistsError struct{}

func (e *EmailAlreadyExistsError) Error() string { return "email already exists" }

type WrongCredentialsError struct{}

func (e *WrongCredentialsError) Error() string { return "wrong credentials" }

type UserNotFoundError struct{}

func (e *UserNotFoundError) Error() string { return "user not found" }

type SelfDisableError struct{}

func (e *SelfDisableError) Error() string { return "cannot disable your own account" }
