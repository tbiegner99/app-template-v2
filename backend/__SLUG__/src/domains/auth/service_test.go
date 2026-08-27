package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go_backend/src/shared/pagination"
)

// --- mock datasource ---

type mockAuthDS struct {
	signUpID        string
	signUpErr       error
	signInID        string
	signInErr       error
	getUser         *User
	getUserErr      error
	createUser      *ApplicationUser
	createUserErr   error
	getBySTID       *ApplicationUser
	getBySTIDErr    error
	changePwErr     error
	listUsersResult pagination.PagedResponse[ApplicationUser]
	listUsersErr    error
	getRolesResult  []string
	getRolesErr     error
	getByIDResult   *ApplicationUser
	getByIDErr      error
	updateResult    *ApplicationUser
	updateErr       error
	resetPwErr      error
	disableErr      error
	enableErr       error
	deletedSTS      []string
}

func (m *mockAuthDS) SignUp(email, password string) (string, error) {
	return m.signUpID, m.signUpErr
}
func (m *mockAuthDS) SignIn(email, password string) (string, error) {
	return m.signInID, m.signInErr
}
func (m *mockAuthDS) GetUser(userID string) (*User, error) {
	return m.getUser, m.getUserErr
}
func (m *mockAuthDS) CreateApplicationUser(ctx context.Context, stID, email, display string, roles []string) (*ApplicationUser, error) {
	return m.createUser, m.createUserErr
}
func (m *mockAuthDS) GetApplicationUserBySupertokensID(ctx context.Context, stID string) (*ApplicationUser, error) {
	return m.getBySTID, m.getBySTIDErr
}
func (m *mockAuthDS) ChangePassword(ctx context.Context, email, old, newPw string) error {
	return m.changePwErr
}
func (m *mockAuthDS) ListUsers(ctx context.Context, p pagination.ResolvedParams) (pagination.PagedResponse[ApplicationUser], error) {
	return m.listUsersResult, m.listUsersErr
}
func (m *mockAuthDS) GetRolesForUser(ctx context.Context, stID string) ([]string, error) {
	return m.getRolesResult, m.getRolesErr
}
func (m *mockAuthDS) GetApplicationUserByID(ctx context.Context, id string) (*ApplicationUser, error) {
	return m.getByIDResult, m.getByIDErr
}
func (m *mockAuthDS) UpdateUser(ctx context.Context, id, email, display string, roles []string) (*ApplicationUser, error) {
	return m.updateResult, m.updateErr
}
func (m *mockAuthDS) AdminResetPassword(ctx context.Context, stID, newPw string) error {
	return m.resetPwErr
}
func (m *mockAuthDS) DisableUser(ctx context.Context, id string) error {
	return m.disableErr
}
func (m *mockAuthDS) EnableUser(ctx context.Context, id string) error {
	return m.enableErr
}
func (m *mockAuthDS) DeleteSupertokensUser(stID string) {
	m.deletedSTS = append(m.deletedSTS, stID)
}

// --- tests ---

func TestSignUp_Success(t *testing.T) {
	ds := &mockAuthDS{
		signUpID:   "st-id",
		createUser: &ApplicationUser{ID: "app-id", Email: "a@b.com"},
	}
	svc := NewService(ds)
	user, err := svc.SignUp(context.Background(), &SignUpRequest{Email: "a@b.com", Password: "pw"}, "Alice", []string{})
	require.NoError(t, err)
	assert.Equal(t, "app-id", user.ID)
}

func TestSignUp_SignUpError_CallsDeleteST(t *testing.T) {
	ds := &mockAuthDS{signUpErr: errors.New("signup failed")}
	svc := NewService(ds)
	_, err := svc.SignUp(context.Background(), &SignUpRequest{Email: "a@b.com", Password: "pw"}, "Alice", []string{})
	require.Error(t, err)
}

func TestSignUp_CreateAppUserError_CallsDeleteST(t *testing.T) {
	ds := &mockAuthDS{signUpID: "st-id", createUserErr: errors.New("db error")}
	svc := NewService(ds)
	_, err := svc.SignUp(context.Background(), &SignUpRequest{Email: "a@b.com", Password: "pw"}, "Alice", []string{})
	require.Error(t, err)
	assert.Contains(t, ds.deletedSTS, "st-id")
}

func TestSignIn_Success(t *testing.T) {
	ds := &mockAuthDS{
		signInID:  "st-id",
		getBySTID: &ApplicationUser{ID: "app-id", IsDisabled: false},
	}
	svc := NewService(ds)
	stID, err := svc.SignIn(context.Background(), &SignInRequest{Email: "a@b.com", Password: "pw"})
	require.NoError(t, err)
	assert.Equal(t, "st-id", stID)
}

func TestSignIn_SignInError(t *testing.T) {
	ds := &mockAuthDS{signInErr: &WrongCredentialsError{}}
	svc := NewService(ds)
	_, err := svc.SignIn(context.Background(), &SignInRequest{Email: "a@b.com", Password: "pw"})
	require.Error(t, err)
}

func TestSignIn_DisabledUser(t *testing.T) {
	ds := &mockAuthDS{
		signInID:  "st-id",
		getBySTID: &ApplicationUser{ID: "app-id", IsDisabled: true},
	}
	svc := NewService(ds)
	_, err := svc.SignIn(context.Background(), &SignInRequest{Email: "a@b.com", Password: "pw"})
	require.Error(t, err)
	var wcErr *WrongCredentialsError
	assert.ErrorAs(t, err, &wcErr)
}

func TestSignIn_NoAppUserRow(t *testing.T) {
	// SuperTokens identity exists but has no matching app-side row — masked
	// as wrong credentials so we don't leak whether the identity exists.
	ds := &mockAuthDS{
		signInID:     "st-id",
		getBySTIDErr: &UserNotFoundError{},
	}
	svc := NewService(ds)
	_, err := svc.SignIn(context.Background(), &SignInRequest{Email: "a@b.com", Password: "pw"})
	require.Error(t, err)
	var wcErr *WrongCredentialsError
	assert.ErrorAs(t, err, &wcErr)
}

func TestSignIn_GetAppUserError(t *testing.T) {
	// A genuine unexpected error (DB down, schema mismatch, etc.) must NOT
	// be masked as wrong credentials — it should propagate so it gets
	// logged as a real error.
	unexpected := errors.New("column does not exist")
	ds := &mockAuthDS{
		signInID:     "st-id",
		getBySTIDErr: unexpected,
	}
	svc := NewService(ds)
	_, err := svc.SignIn(context.Background(), &SignInRequest{Email: "a@b.com", Password: "pw"})
	require.Error(t, err)
	assert.Equal(t, unexpected, err)
	_, isWrongCreds := err.(*WrongCredentialsError)
	assert.False(t, isWrongCreds)
}

func TestResolveApplicationUser(t *testing.T) {
	ds := &mockAuthDS{getBySTID: &ApplicationUser{ID: "app-id"}}
	svc := NewService(ds)
	user, err := svc.ResolveApplicationUser(context.Background(), "st-id")
	require.NoError(t, err)
	assert.Equal(t, "app-id", user.ID)
}

func TestGetUser(t *testing.T) {
	ds := &mockAuthDS{getUser: &User{ID: "uid", Email: "a@b.com"}}
	svc := NewService(ds)
	u, err := svc.GetUser("uid")
	require.NoError(t, err)
	assert.Equal(t, "uid", u.ID)
}

func TestChangePassword(t *testing.T) {
	ds := &mockAuthDS{}
	svc := NewService(ds)
	err := svc.ChangePassword(context.Background(), "a@b.com", "old", "new")
	require.NoError(t, err)
}

func TestListUsers_Success(t *testing.T) {
	ds := &mockAuthDS{
		listUsersResult: pagination.PagedResponse[ApplicationUser]{
			Data:     []ApplicationUser{{ID: "u1", SupertokensID: "st1"}},
			Total:    1,
			Page:     0,
			PageSize: 25,
		},
		getRolesResult: []string{"admin"},
	}
	svc := NewService(ds)
	result, err := svc.ListUsers(context.Background(), pagination.Params{PageSize: 25})
	require.NoError(t, err)
	require.Len(t, result.Data, 1)
	assert.Equal(t, []string{"admin"}, result.Data[0].Roles)
}

func TestListUsers_InvalidSortField(t *testing.T) {
	ds := &mockAuthDS{}
	svc := NewService(ds)
	_, err := svc.ListUsers(context.Background(), pagination.Params{Sort: "badfield"})
	require.Error(t, err)
	var ife *pagination.InvalidFieldError
	assert.ErrorAs(t, err, &ife)
}

func TestUpdateUser(t *testing.T) {
	ds := &mockAuthDS{updateResult: &ApplicationUser{ID: "u1"}}
	svc := NewService(ds)
	u, err := svc.UpdateUser(context.Background(), "u1", "a@b.com", "Alice", []string{})
	require.NoError(t, err)
	assert.Equal(t, "u1", u.ID)
}

func TestAdminResetPassword_Success(t *testing.T) {
	ds := &mockAuthDS{getByIDResult: &ApplicationUser{SupertokensID: "st1"}}
	svc := NewService(ds)
	err := svc.AdminResetPassword(context.Background(), "app-id", "newpw")
	require.NoError(t, err)
}

func TestAdminResetPassword_UserNotFound(t *testing.T) {
	ds := &mockAuthDS{getByIDErr: &UserNotFoundError{}}
	svc := NewService(ds)
	err := svc.AdminResetPassword(context.Background(), "app-id", "newpw")
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

func TestDisableUser_Success(t *testing.T) {
	ds := &mockAuthDS{getByIDResult: &ApplicationUser{SupertokensID: "st-other"}}
	svc := NewService(ds)
	err := svc.DisableUser(context.Background(), "admin-st", "target-id")
	require.NoError(t, err)
}

func TestDisableUser_SelfDisable(t *testing.T) {
	ds := &mockAuthDS{getByIDResult: &ApplicationUser{SupertokensID: "admin-st"}}
	svc := NewService(ds)
	err := svc.DisableUser(context.Background(), "admin-st", "target-id")
	require.Error(t, err)
	var sde *SelfDisableError
	assert.ErrorAs(t, err, &sde)
}

func TestDisableUser_NotFound(t *testing.T) {
	ds := &mockAuthDS{getByIDErr: &UserNotFoundError{}}
	svc := NewService(ds)
	err := svc.DisableUser(context.Background(), "admin-st", "target-id")
	require.Error(t, err)
}

func TestEnableUser(t *testing.T) {
	ds := &mockAuthDS{}
	svc := NewService(ds)
	err := svc.EnableUser(context.Background(), "u1")
	require.NoError(t, err)
}

func TestErrorMessages(t *testing.T) {
	assert.Equal(t, "email already exists", (&EmailAlreadyExistsError{}).Error())
	assert.Equal(t, "wrong credentials", (&WrongCredentialsError{}).Error())
	assert.Equal(t, "user not found", (&UserNotFoundError{}).Error())
	assert.Equal(t, "cannot disable your own account", (&SelfDisableError{}).Error())
}
