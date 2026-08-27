package auth

import (
	"context"
	"errors"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	epmodels "github.com/supertokens/supertokens-golang/recipe/emailpassword/epmodels"
	userrolesmodels "github.com/supertokens/supertokens-golang/recipe/userroles/userrolesmodels"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go_backend/src/logger"
	"go_backend/src/shared/pagination"
)

// --- mock adapters ---

type mockEP struct {
	signUpResp epmodels.SignUpResponse
	signUpErr  error
	signInResp epmodels.SignInResponse
	signInErr  error
	getUserResp *epmodels.User
	getUserErr  error
	updateResp epmodels.UpdateEmailOrPasswordResponse
	updateErr  error
}

func (m *mockEP) SignUp(tenantID, email, password string) (epmodels.SignUpResponse, error) {
	return m.signUpResp, m.signUpErr
}
func (m *mockEP) SignIn(tenantID, email, password string) (epmodels.SignInResponse, error) {
	return m.signInResp, m.signInErr
}
func (m *mockEP) GetUserByID(userID string) (*epmodels.User, error) {
	return m.getUserResp, m.getUserErr
}
func (m *mockEP) UpdateEmailOrPassword(userID string, email, password *string, apply *bool, tenantID *string) (epmodels.UpdateEmailOrPasswordResponse, error) {
	return m.updateResp, m.updateErr
}

type mockSessAPI struct {
	revokeErr error
}

func (m *mockSessAPI) RevokeAllSessionsForUser(userID string, tenantID *string) ([]string, error) {
	return nil, m.revokeErr
}

type mockRolesAPI struct {
	addErr     error
	getRoles   userrolesmodels.GetRolesForUserResponse
	getRolesErr error
	removeErr  error
}

func (m *mockRolesAPI) AddRoleToUser(tenantID, userID, role string) (userrolesmodels.AddRoleToUserResponse, error) {
	return userrolesmodels.AddRoleToUserResponse{}, m.addErr
}
func (m *mockRolesAPI) GetRolesForUser(tenantID, userID string) (userrolesmodels.GetRolesForUserResponse, error) {
	return m.getRoles, m.getRolesErr
}
func (m *mockRolesAPI) RemoveUserRole(tenantID, userID, role string) (userrolesmodels.RemoveUserRoleResponse, error) {
	return userrolesmodels.RemoveUserRoleResponse{}, m.removeErr
}

type mockSTAPI struct {
	deleteErr error
	deleted   []string
}

func (m *mockSTAPI) DeleteUser(userID string) error {
	m.deleted = append(m.deleted, userID)
	return m.deleteErr
}

// --- helper to create a datasource with mocks ---

func newTestDatasource(t *testing.T) (*Datasource, sqlmock.Sqlmock, *mockEP, *mockRolesAPI, *mockSessAPI, *mockSTAPI) {
	t.Helper()
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	t.Cleanup(func() { db.Close() })
	ldb := logger.NewLoggingDB(db)
	ep := &mockEP{}
	roles := &mockRolesAPI{}
	sess := &mockSessAPI{}
	st := &mockSTAPI{}
	ds := &Datasource{db: ldb, ep: ep, roles: roles, sess: sess, st: st}
	return ds, mock, ep, roles, sess, st
}

// --- SignUp tests ---

func TestDSSignUp_Success(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signUpResp = epmodels.SignUpResponse{
		OK: &struct{ User epmodels.User }{User: epmodels.User{ID: "st-id-1", Email: "a@b.com"}},
	}
	id, err := ds.SignUp("a@b.com", "pw")
	require.NoError(t, err)
	assert.Equal(t, "st-id-1", id)
}

func TestDSSignUp_EmailAlreadyExists(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signUpResp = epmodels.SignUpResponse{
		EmailAlreadyExistsError: &struct{}{},
	}
	_, err := ds.SignUp("a@b.com", "pw")
	require.Error(t, err)
	var eae *EmailAlreadyExistsError
	assert.ErrorAs(t, err, &eae)
}

func TestDSSignUp_Error(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signUpErr = errors.New("supertokens error")
	_, err := ds.SignUp("a@b.com", "pw")
	require.Error(t, err)
}

// --- SignIn tests ---

func TestDSSignIn_Success(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signInResp = epmodels.SignInResponse{
		OK: &struct{ User epmodels.User }{User: epmodels.User{ID: "st-id-1"}},
	}
	id, err := ds.SignIn("a@b.com", "pw")
	require.NoError(t, err)
	assert.Equal(t, "st-id-1", id)
}

func TestDSSignIn_WrongCredentials(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signInResp = epmodels.SignInResponse{
		WrongCredentialsError: &struct{}{},
	}
	_, err := ds.SignIn("a@b.com", "pw")
	require.Error(t, err)
	var wce *WrongCredentialsError
	assert.ErrorAs(t, err, &wce)
}

// --- GetUser tests ---

func TestDSGetUser_Success(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.getUserResp = &epmodels.User{ID: "uid", Email: "a@b.com"}
	u, err := ds.GetUser("uid")
	require.NoError(t, err)
	assert.Equal(t, "uid", u.ID)
	assert.Equal(t, "a@b.com", u.Email)
}

func TestDSGetUser_NotFound(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.getUserResp = nil
	_, err := ds.GetUser("uid")
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

func TestDSGetUser_Error(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.getUserErr = errors.New("sdk error")
	_, err := ds.GetUser("uid")
	require.Error(t, err)
}

// --- CreateApplicationUser tests ---

func TestDSCreateApplicationUser_Success(t *testing.T) {
	ds, mock, _, roles, _, _ := newTestDatasource(t)
	roles.getRoles = userrolesmodels.GetRolesForUserResponse{
		OK: &struct{ Roles []string }{Roles: []string{}},
	}
	mock.ExpectExec(`INSERT INTO users`).
		WithArgs(sqlmock.AnyArg(), "st-id", "a@b.com", "Alice", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	u, err := ds.CreateApplicationUser(context.Background(), "st-id", "a@b.com", "Alice", []string{"admin"})
	require.NoError(t, err)
	assert.Equal(t, "a@b.com", u.Email)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDSCreateApplicationUser_DBError(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectExec(`INSERT INTO users`).
		WillReturnError(errors.New("db error"))
	_, err := ds.CreateApplicationUser(context.Background(), "st-id", "a@b.com", "Alice", []string{})
	require.Error(t, err)
}

func TestDSCreateApplicationUser_AddRoleError(t *testing.T) {
	ds, mock, _, roles, _, _ := newTestDatasource(t)
	roles.addErr = errors.New("role error")
	mock.ExpectExec(`INSERT INTO users`).
		WithArgs(sqlmock.AnyArg(), "st-id", "a@b.com", "Alice", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))
	_, err := ds.CreateApplicationUser(context.Background(), "st-id", "a@b.com", "Alice", []string{"admin"})
	require.Error(t, err)
}

// --- GetApplicationUserBySupertokensID tests ---

func TestDSGetBySupertokensID_Found(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	rows := sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}).
		AddRow("app-id", "st-id", "a@b.com", "Alice", false, "2024-01-01", "2024-01-01")
	mock.ExpectQuery(`SELECT .* FROM users WHERE supertokens_id`).
		WithArgs("st-id").
		WillReturnRows(rows)

	u, err := ds.GetApplicationUserBySupertokensID(context.Background(), "st-id")
	require.NoError(t, err)
	assert.Equal(t, "app-id", u.ID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDSGetBySupertokensID_NotFound(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`SELECT .* FROM users WHERE supertokens_id`).
		WithArgs("st-id").
		WillReturnRows(sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}))

	_, err := ds.GetApplicationUserBySupertokensID(context.Background(), "st-id")
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

// --- ChangePassword tests ---

func TestDSChangePassword_Success(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signInResp = epmodels.SignInResponse{
		OK: &struct{ User epmodels.User }{User: epmodels.User{ID: "uid"}},
	}
	ep.updateResp = epmodels.UpdateEmailOrPasswordResponse{
		OK: &struct{}{},
	}
	err := ds.ChangePassword(context.Background(), "a@b.com", "old", "new")
	require.NoError(t, err)
}

func TestDSChangePassword_WrongCredentials(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signInResp = epmodels.SignInResponse{
		WrongCredentialsError: &struct{}{},
	}
	err := ds.ChangePassword(context.Background(), "a@b.com", "wrong", "new")
	require.Error(t, err)
	var wce *WrongCredentialsError
	assert.ErrorAs(t, err, &wce)
}

// --- ListUsers tests ---

func TestDSListUsers_Empty(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM users`).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))
	mock.ExpectQuery(`SELECT .* FROM users`).
		WillReturnRows(sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}))

	result, err := ds.ListUsers(context.Background(), resolvedParams(0, 25))
	require.NoError(t, err)
	assert.Equal(t, 0, result.Total)
	assert.Empty(t, result.Data)
}

func TestDSListUsers_WithResults(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM users`).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
	userRows := sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}).
		AddRow("u1", "st1", "a@b.com", "Alice", false, "2024-01-01", "2024-01-01")
	mock.ExpectQuery(`SELECT .* FROM users`).
		WillReturnRows(userRows)

	result, err := ds.ListUsers(context.Background(), resolvedParams(0, 25))
	require.NoError(t, err)
	assert.Equal(t, 1, result.Total)
	require.Len(t, result.Data, 1)
	assert.Equal(t, "u1", result.Data[0].ID)
}

// --- GetRolesForUser tests ---

func TestDSGetRolesForUser_Success(t *testing.T) {
	ds, _, _, roles, _, _ := newTestDatasource(t)
	roles.getRoles = userrolesmodels.GetRolesForUserResponse{
		OK: &struct{ Roles []string }{Roles: []string{"admin", "user"}},
	}
	result, err := ds.GetRolesForUser(context.Background(), "st-id")
	require.NoError(t, err)
	assert.Equal(t, []string{"admin", "user"}, result)
}

func TestDSGetRolesForUser_Error(t *testing.T) {
	ds, _, _, roles, _, _ := newTestDatasource(t)
	roles.getRolesErr = errors.New("sdk error")
	_, err := ds.GetRolesForUser(context.Background(), "st-id")
	require.Error(t, err)
}

// --- GetApplicationUserByID tests ---

func TestDSGetByID_Found(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	rows := sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}).
		AddRow("app-id", "st-id", "a@b.com", "Alice", false, "2024-01-01", "2024-01-01")
	mock.ExpectQuery(`SELECT .* FROM users WHERE id`).
		WithArgs("app-id").
		WillReturnRows(rows)

	u, err := ds.GetApplicationUserByID(context.Background(), "app-id")
	require.NoError(t, err)
	assert.Equal(t, "app-id", u.ID)
}

func TestDSGetByID_NotFound(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`SELECT .* FROM users WHERE id`).
		WithArgs("missing").
		WillReturnRows(sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}))

	_, err := ds.GetApplicationUserByID(context.Background(), "missing")
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

// --- UpdateUser tests ---

func TestDSUpdateUser_Success(t *testing.T) {
	ds, mock, _, roles, _, _ := newTestDatasource(t)
	rows := sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}).
		AddRow("u1", "st1", "new@b.com", "New Name", false, "2024-01-01", "2024-01-01")
	mock.ExpectQuery(`UPDATE users SET email`).
		WillReturnRows(rows)
	roles.getRoles = userrolesmodels.GetRolesForUserResponse{
		OK: &struct{ Roles []string }{Roles: []string{"admin"}},
	}

	u, err := ds.UpdateUser(context.Background(), "u1", "new@b.com", "New Name", []string{"admin"})
	require.NoError(t, err)
	assert.Equal(t, "u1", u.ID)
}

func TestDSUpdateUser_NotFound(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`UPDATE users SET email`).
		WillReturnRows(sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}))

	_, err := ds.UpdateUser(context.Background(), "missing", "a@b.com", "Name", []string{})
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

// --- AdminResetPassword tests ---

func TestDSAdminResetPassword_Success(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.updateResp = epmodels.UpdateEmailOrPasswordResponse{OK: &struct{}{}}
	err := ds.AdminResetPassword(context.Background(), "st-id", "newpw")
	require.NoError(t, err)
}

func TestDSAdminResetPassword_UnknownUser(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.updateResp = epmodels.UpdateEmailOrPasswordResponse{
		UnknownUserIdError: &struct{}{},
	}
	err := ds.AdminResetPassword(context.Background(), "st-id", "newpw")
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

// --- DisableUser tests ---

func TestDSDisableUser_Success(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`UPDATE users SET is_disabled = true`).
		WithArgs(sqlmock.AnyArg(), "u1").
		WillReturnRows(sqlmock.NewRows([]string{"supertokens_id"}).AddRow("st-id"))

	err := ds.DisableUser(context.Background(), "u1")
	require.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDSDisableUser_NotFound(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`UPDATE users SET is_disabled = true`).
		WithArgs(sqlmock.AnyArg(), "u1").
		WillReturnRows(sqlmock.NewRows([]string{"supertokens_id"}))

	err := ds.DisableUser(context.Background(), "u1")
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

// --- EnableUser tests ---

func TestDSEnableUser_Success(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectExec(`UPDATE users SET is_disabled = false`).
		WithArgs(sqlmock.AnyArg(), "u1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	err := ds.EnableUser(context.Background(), "u1")
	require.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDSEnableUser_NotFound(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectExec(`UPDATE users SET is_disabled = false`).
		WithArgs(sqlmock.AnyArg(), "u1").
		WillReturnResult(sqlmock.NewResult(0, 0))

	err := ds.EnableUser(context.Background(), "u1")
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

// --- DeleteSupertokensUser tests ---

func TestDSDeleteSupertokensUser(t *testing.T) {
	ds, _, _, _, _, st := newTestDatasource(t)
	ds.DeleteSupertokensUser("st-id-1")
	assert.Contains(t, st.deleted, "st-id-1")
}

// --- helper ---

func resolvedParams(page, pageSize int) pagination.ResolvedParams {
	return pagination.ResolvedParams{
		Page:     page,
		PageSize: pageSize,
		SortDir:  pagination.SortAsc,
	}
}

// --- Additional coverage tests ---

func TestDSChangePassword_UpdateError(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signInResp = epmodels.SignInResponse{
		OK: &struct{ User epmodels.User }{User: epmodels.User{ID: "uid"}},
	}
	ep.updateErr = errors.New("update failed")
	err := ds.ChangePassword(context.Background(), "a@b.com", "old", "new")
	require.Error(t, err)
}

func TestDSChangePassword_UnknownUser(t *testing.T) {
	ds, _, ep, _, _, _ := newTestDatasource(t)
	ep.signInResp = epmodels.SignInResponse{
		OK: &struct{ User epmodels.User }{User: epmodels.User{ID: "uid"}},
	}
	ep.updateResp = epmodels.UpdateEmailOrPasswordResponse{
		UnknownUserIdError: &struct{}{},
	}
	err := ds.ChangePassword(context.Background(), "a@b.com", "old", "new")
	require.Error(t, err)
	var nfe *UserNotFoundError
	assert.ErrorAs(t, err, &nfe)
}

func TestDSListUsers_WithFilters(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM users`).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
	userRows := sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}).
		AddRow("u1", "st1", "a@b.com", "Alice", false, "2024-01-01", "2024-01-01")
	mock.ExpectQuery(`SELECT .* FROM users`).
		WillReturnRows(userRows)

	params := pagination.ResolvedParams{
		Page:     0,
		PageSize: 25,
		SortDir:  pagination.SortAsc,
		Sort:     "email",
		Filters: []pagination.ResolvedFilter{
			{Column: "email", Op: pagination.OpContains, Value: "a@b"},
			{Column: "is_disabled", Op: pagination.OpEq, Value: "false"},
		},
	}
	result, err := ds.ListUsers(context.Background(), params)
	require.NoError(t, err)
	assert.Equal(t, 1, result.Total)
}

func TestDSListUsers_CountError(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM users`).
		WillReturnError(errors.New("db error"))

	_, err := ds.ListUsers(context.Background(), resolvedParams(0, 25))
	require.Error(t, err)
}

func TestDSListUsers_QueryError(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM users`).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
	mock.ExpectQuery(`SELECT .* FROM users`).
		WillReturnError(errors.New("db error"))

	_, err := ds.ListUsers(context.Background(), resolvedParams(0, 25))
	require.Error(t, err)
}

func TestDSListUsers_AllFilterOps(t *testing.T) {
	ds, mock, _, _, _, _ := newTestDatasource(t)
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM users`).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))
	mock.ExpectQuery(`SELECT .* FROM users`).
		WillReturnRows(sqlmock.NewRows([]string{"id", "supertokens_id", "email", "display_name", "is_disabled", "date_created", "last_modified"}))

	params := pagination.ResolvedParams{
		Page: 0, PageSize: 25, SortDir: pagination.SortDesc,
		Filters: []pagination.ResolvedFilter{
			{Column: "x", Op: pagination.OpGt, Value: "1"},
			{Column: "x", Op: pagination.OpGte, Value: "1"},
			{Column: "x", Op: pagination.OpLt, Value: "5"},
			{Column: "x", Op: pagination.OpLte, Value: "5"},
		},
	}
	_, err := ds.ListUsers(context.Background(), params)
	require.NoError(t, err)
}

func TestDSDisableUser_RevokeError(t *testing.T) {
	ds, mock, _, _, sess, _ := newTestDatasource(t)
	sess.revokeErr = errors.New("revoke failed")
	mock.ExpectQuery(`UPDATE users SET is_disabled = true`).
		WithArgs(sqlmock.AnyArg(), "u1").
		WillReturnRows(sqlmock.NewRows([]string{"supertokens_id"}).AddRow("st-id"))

	err := ds.DisableUser(context.Background(), "u1")
	require.Error(t, err)
}
