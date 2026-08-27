package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
	sessmodels "github.com/supertokens/supertokens-golang/recipe/session/sessmodels"
	"go_backend/src/shared/pagination"
)

// --- mock service ---

type mockAuthService struct {
	signUpResult   *ApplicationUser
	signUpErr      error
	signInID       string
	signInErr      error
	resolveUser    *ApplicationUser
	resolveErr     error
	getUser        *User
	getUserErr     error
	changePwErr    error
	listResult     pagination.PagedResponse[ApplicationUser]
	listErr        error
	updateResult   *ApplicationUser
	updateErr      error
	resetPwErr     error
	disableErr     error
	enableErr      error
}

func (m *mockAuthService) SignUp(ctx context.Context, req *SignUpRequest, displayName string, roles []string) (*ApplicationUser, error) {
	return m.signUpResult, m.signUpErr
}
func (m *mockAuthService) SignIn(ctx context.Context, req *SignInRequest) (string, error) {
	return m.signInID, m.signInErr
}
func (m *mockAuthService) ResolveApplicationUser(ctx context.Context, stID string) (*ApplicationUser, error) {
	return m.resolveUser, m.resolveErr
}
func (m *mockAuthService) GetUser(userID string) (*User, error) {
	return m.getUser, m.getUserErr
}
func (m *mockAuthService) ChangePassword(ctx context.Context, email, old, newPw string) error {
	return m.changePwErr
}
func (m *mockAuthService) ListUsers(ctx context.Context, params pagination.Params) (pagination.PagedResponse[ApplicationUser], error) {
	return m.listResult, m.listErr
}
func (m *mockAuthService) UpdateUser(ctx context.Context, id, email, display string, roles []string) (*ApplicationUser, error) {
	return m.updateResult, m.updateErr
}
func (m *mockAuthService) AdminResetPassword(ctx context.Context, userID, newPw string) error {
	return m.resetPwErr
}
func (m *mockAuthService) DisableUser(ctx context.Context, adminST, targetID string) error {
	return m.disableErr
}
func (m *mockAuthService) EnableUser(ctx context.Context, id string) error {
	return m.enableErr
}

// --- mock session ---

type mockSession struct {
	userID    string
	revokeErr error
}

func (m *mockSession) GetUserID() string  { return m.userID }
func (m *mockSession) RevokeSession() error { return m.revokeErr }

// --- factory ---

func newAuthController(svc authService, session sessionContainer) *Controller {
	c := NewController(svc, NewMapper())
	c.getSession = func(ctx context.Context) sessionContainer {
		return session
	}
	c.createSession = func(r *http.Request, w http.ResponseWriter, userID string, claims map[string]interface{}) error {
		return nil
	}
	return c
}

// --- SignUp tests ---

func TestSignUp_Valid(t *testing.T) {
	svc := &mockAuthService{signUpResult: &ApplicationUser{ID: "u1", SupertokensID: "st1", Email: "a@b.com"}}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(SignUpRequestDTO{Email: "a@b.com", Password: "pw123", DisplayName: "Alice"})
	req := httptest.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignUp(rr, req)
	assert.Equal(t, http.StatusCreated, rr.Code)
}

func TestSignUp_InvalidJSON(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := httptest.NewRequest(http.MethodPost, "/signup", bytes.NewBufferString("not json"))
	rr := httptest.NewRecorder()
	ctrl.SignUp(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestSignUp_EmailAlreadyExists(t *testing.T) {
	svc := &mockAuthService{signUpErr: &EmailAlreadyExistsError{}}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(SignUpRequestDTO{Email: "a@b.com", Password: "pw"})
	req := httptest.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignUp(rr, req)
	assert.Equal(t, http.StatusConflict, rr.Code)
}

func TestSignUp_ServiceError(t *testing.T) {
	svc := &mockAuthService{signUpErr: errors.New("internal")}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(SignUpRequestDTO{Email: "a@b.com", Password: "pw"})
	req := httptest.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignUp(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestSignUp_CreateSessionError(t *testing.T) {
	svc := &mockAuthService{signUpResult: &ApplicationUser{ID: "u1", SupertokensID: "st1"}}
	ctrl := NewController(svc, NewMapper())
	ctrl.getSession = func(ctx context.Context) sessionContainer { return nil }
	ctrl.createSession = func(r *http.Request, w http.ResponseWriter, userID string, claims map[string]interface{}) error {
		return errors.New("session error")
	}
	body, _ := json.Marshal(SignUpRequestDTO{Email: "a@b.com", Password: "pw"})
	req := httptest.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignUp(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- SignIn tests ---

func TestSignIn_Valid(t *testing.T) {
	svc := &mockAuthService{
		signInID:    "st-id",
		resolveUser: &ApplicationUser{ID: "u1", SupertokensID: "st-id"},
	}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(SignInRequestDTO{Email: "a@b.com", Password: "pw"})
	req := httptest.NewRequest(http.MethodPost, "/signin", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignIn(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestSignIn_InvalidJSON(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := httptest.NewRequest(http.MethodPost, "/signin", bytes.NewBufferString("bad"))
	rr := httptest.NewRecorder()
	ctrl.SignIn(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestSignIn_WrongCredentials(t *testing.T) {
	svc := &mockAuthService{signInErr: &WrongCredentialsError{}}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(SignInRequestDTO{Email: "a@b.com", Password: "wrong"})
	req := httptest.NewRequest(http.MethodPost, "/signin", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignIn(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}

func TestSignIn_ServiceError(t *testing.T) {
	svc := &mockAuthService{signInErr: errors.New("db error")}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(SignInRequestDTO{Email: "a@b.com", Password: "pw"})
	req := httptest.NewRequest(http.MethodPost, "/signin", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignIn(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestSignIn_ResolveError(t *testing.T) {
	svc := &mockAuthService{signInID: "st-id", resolveErr: errors.New("not found")}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(SignInRequestDTO{Email: "a@b.com", Password: "pw"})
	req := httptest.NewRequest(http.MethodPost, "/signin", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignIn(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestSignIn_CreateSessionError(t *testing.T) {
	svc := &mockAuthService{
		signInID:    "st-id",
		resolveUser: &ApplicationUser{ID: "u1", SupertokensID: "st-id"},
	}
	ctrl := NewController(svc, NewMapper())
	ctrl.getSession = func(ctx context.Context) sessionContainer { return nil }
	ctrl.createSession = func(r *http.Request, w http.ResponseWriter, userID string, claims map[string]interface{}) error {
		return errors.New("session error")
	}
	body, _ := json.Marshal(SignInRequestDTO{Email: "a@b.com", Password: "pw"})
	req := httptest.NewRequest(http.MethodPost, "/signin", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.SignIn(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- SignOut tests ---

func TestSignOut_NoSession(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := httptest.NewRequest(http.MethodPost, "/signout", nil)
	rr := httptest.NewRecorder()
	ctrl.SignOut(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestSignOut_WithSession(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, &mockSession{userID: "st-id"})
	req := httptest.NewRequest(http.MethodPost, "/signout", nil)
	rr := httptest.NewRecorder()
	ctrl.SignOut(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestSignOut_RevokeError(t *testing.T) {
	sess := &mockSession{userID: "st-id", revokeErr: errors.New("revoke error")}
	ctrl := newAuthController(&mockAuthService{}, sess)
	req := httptest.NewRequest(http.MethodPost, "/signout", nil)
	rr := httptest.NewRecorder()
	ctrl.SignOut(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- GetMe tests ---

func TestGetMe_NoSession(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	rr := httptest.NewRecorder()
	ctrl.GetMe(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}

func TestGetMe_WithSession(t *testing.T) {
	svc := &mockAuthService{resolveUser: &ApplicationUser{ID: "u1", Email: "a@b.com"}}
	ctrl := newAuthController(svc, &mockSession{userID: "st-id"})
	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	rr := httptest.NewRecorder()
	ctrl.GetMe(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestGetMe_ResolveError(t *testing.T) {
	svc := &mockAuthService{resolveErr: errors.New("not found")}
	ctrl := newAuthController(svc, &mockSession{userID: "st-id"})
	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	rr := httptest.NewRecorder()
	ctrl.GetMe(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- ChangePassword tests ---

func TestChangePassword_NoSession(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := httptest.NewRequest(http.MethodPatch, "/change-password", bytes.NewBufferString("{}"))
	rr := httptest.NewRecorder()
	ctrl.ChangePassword(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}

func TestChangePassword_InvalidJSON(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{resolveUser: &ApplicationUser{Email: "a@b.com"}}, &mockSession{userID: "st"})
	req := httptest.NewRequest(http.MethodPatch, "/change-password", bytes.NewBufferString("bad"))
	rr := httptest.NewRecorder()
	ctrl.ChangePassword(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestChangePassword_MissingFields(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{resolveUser: &ApplicationUser{Email: "a@b.com"}}, &mockSession{userID: "st"})
	body, _ := json.Marshal(ChangePasswordRequestDTO{OldPassword: "old"})
	req := httptest.NewRequest(http.MethodPatch, "/change-password", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.ChangePassword(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestChangePassword_WrongCredentials(t *testing.T) {
	svc := &mockAuthService{resolveUser: &ApplicationUser{Email: "a@b.com"}, changePwErr: &WrongCredentialsError{}}
	ctrl := newAuthController(svc, &mockSession{userID: "st"})
	body, _ := json.Marshal(ChangePasswordRequestDTO{OldPassword: "old", NewPassword: "new"})
	req := httptest.NewRequest(http.MethodPatch, "/change-password", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.ChangePassword(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestChangePassword_Success(t *testing.T) {
	svc := &mockAuthService{resolveUser: &ApplicationUser{Email: "a@b.com"}}
	ctrl := newAuthController(svc, &mockSession{userID: "st"})
	body, _ := json.Marshal(ChangePasswordRequestDTO{OldPassword: "old", NewPassword: "new"})
	req := httptest.NewRequest(http.MethodPatch, "/change-password", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.ChangePassword(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestChangePassword_ResolveError(t *testing.T) {
	svc := &mockAuthService{resolveErr: errors.New("db error")}
	ctrl := newAuthController(svc, &mockSession{userID: "st"})
	body, _ := json.Marshal(ChangePasswordRequestDTO{OldPassword: "old", NewPassword: "new"})
	req := httptest.NewRequest(http.MethodPatch, "/change-password", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.ChangePassword(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestChangePassword_OtherError(t *testing.T) {
	svc := &mockAuthService{resolveUser: &ApplicationUser{Email: "a@b.com"}, changePwErr: errors.New("db error")}
	ctrl := newAuthController(svc, &mockSession{userID: "st"})
	body, _ := json.Marshal(ChangePasswordRequestDTO{OldPassword: "old", NewPassword: "new"})
	req := httptest.NewRequest(http.MethodPatch, "/change-password", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.ChangePassword(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- ListUsers tests ---

func TestListUsers_InvalidJSON(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := httptest.NewRequest(http.MethodPost, "/users/list", bytes.NewBufferString("bad"))
	rr := httptest.NewRecorder()
	ctrl.ListUsers(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestListUsers_ControllerInvalidSortField(t *testing.T) {
	svc := &mockAuthService{listErr: &pagination.InvalidFieldError{Field: "badfield"}}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(pagination.Params{})
	req := httptest.NewRequest(http.MethodPost, "/users/list", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.ListUsers(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestListUsers_ControllerSuccess(t *testing.T) {
	svc := &mockAuthService{
		listResult: pagination.PagedResponse[ApplicationUser]{
			Data: []ApplicationUser{{ID: "u1"}}, Total: 1,
		},
	}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(pagination.Params{PageSize: 25})
	req := httptest.NewRequest(http.MethodPost, "/users/list", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.ListUsers(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestListUsers_ServiceError(t *testing.T) {
	svc := &mockAuthService{listErr: errors.New("db error")}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(pagination.Params{})
	req := httptest.NewRequest(http.MethodPost, "/users/list", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.ListUsers(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- UpdateUser tests ---

func newMuxRequest(method, path string, body []byte, vars map[string]string) *http.Request {
	req := httptest.NewRequest(method, path, bytes.NewBuffer(body))
	req = mux.SetURLVars(req, vars)
	return req
}

func TestUpdateUser_InvalidJSON(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := newMuxRequest(http.MethodPatch, "/users/u1", []byte("bad"), map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.UpdateUser(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestUpdateUser_NotFound(t *testing.T) {
	svc := &mockAuthService{updateErr: &UserNotFoundError{}}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(UpdateUserRequestDTO{Email: "a@b.com"})
	req := newMuxRequest(http.MethodPatch, "/users/u1", body, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.UpdateUser(rr, req)
	assert.Equal(t, http.StatusNotFound, rr.Code)
}

func TestUpdateUser_EmailConflict(t *testing.T) {
	svc := &mockAuthService{updateErr: &EmailAlreadyExistsError{}}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(UpdateUserRequestDTO{Email: "a@b.com"})
	req := newMuxRequest(http.MethodPatch, "/users/u1", body, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.UpdateUser(rr, req)
	assert.Equal(t, http.StatusConflict, rr.Code)
}

func TestUpdateUser_Success(t *testing.T) {
	svc := &mockAuthService{updateResult: &ApplicationUser{ID: "u1"}}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(UpdateUserRequestDTO{Email: "a@b.com"})
	req := newMuxRequest(http.MethodPatch, "/users/u1", body, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.UpdateUser(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestUpdateUser_ServiceError(t *testing.T) {
	svc := &mockAuthService{updateErr: errors.New("db error")}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(UpdateUserRequestDTO{Email: "a@b.com"})
	req := newMuxRequest(http.MethodPatch, "/users/u1", body, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.UpdateUser(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- AdminResetPassword tests ---

func TestAdminResetPassword_MissingPassword(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	body, _ := json.Marshal(AdminResetPasswordRequestDTO{})
	req := newMuxRequest(http.MethodPatch, "/users/u1/password", body, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.AdminResetPassword(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestAdminResetPassword_NotFound(t *testing.T) {
	svc := &mockAuthService{resetPwErr: &UserNotFoundError{}}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(AdminResetPasswordRequestDTO{NewPassword: "newpw"})
	req := newMuxRequest(http.MethodPatch, "/users/u1/password", body, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.AdminResetPassword(rr, req)
	assert.Equal(t, http.StatusNotFound, rr.Code)
}

func TestAdminResetPassword_ControllerSuccess(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	body, _ := json.Marshal(AdminResetPasswordRequestDTO{NewPassword: "newpw"})
	req := newMuxRequest(http.MethodPatch, "/users/u1/password", body, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.AdminResetPassword(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestAdminResetPassword_InvalidJSON(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := newMuxRequest(http.MethodPatch, "/users/u1/password", []byte("bad"), map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.AdminResetPassword(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestAdminResetPassword_ServiceError(t *testing.T) {
	svc := &mockAuthService{resetPwErr: errors.New("internal")}
	ctrl := newAuthController(svc, nil)
	body, _ := json.Marshal(AdminResetPasswordRequestDTO{NewPassword: "newpw"})
	req := newMuxRequest(http.MethodPatch, "/users/u1/password", body, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.AdminResetPassword(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- DisableUser tests ---

func TestDisableUser_NoSession(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := newMuxRequest(http.MethodPatch, "/users/u1/disable", nil, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.DisableUser(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}

func TestDisableUser_ControllerSelfDisable(t *testing.T) {
	svc := &mockAuthService{disableErr: &SelfDisableError{}}
	ctrl := newAuthController(svc, &mockSession{userID: "admin-st"})
	req := newMuxRequest(http.MethodPatch, "/users/u1/disable", nil, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.DisableUser(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestDisableUser_ControllerNotFound(t *testing.T) {
	svc := &mockAuthService{disableErr: &UserNotFoundError{}}
	ctrl := newAuthController(svc, &mockSession{userID: "admin-st"})
	req := newMuxRequest(http.MethodPatch, "/users/u1/disable", nil, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.DisableUser(rr, req)
	assert.Equal(t, http.StatusNotFound, rr.Code)
}

func TestDisableUser_ControllerSuccess(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, &mockSession{userID: "admin-st"})
	req := newMuxRequest(http.MethodPatch, "/users/u1/disable", nil, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.DisableUser(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestDisableUser_ServiceError(t *testing.T) {
	svc := &mockAuthService{disableErr: errors.New("internal")}
	ctrl := newAuthController(svc, &mockSession{userID: "admin-st"})
	req := newMuxRequest(http.MethodPatch, "/users/u1/disable", nil, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.DisableUser(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- EnableUser tests ---

func TestEnableUser_NotFound(t *testing.T) {
	svc := &mockAuthService{enableErr: &UserNotFoundError{}}
	ctrl := newAuthController(svc, nil)
	req := newMuxRequest(http.MethodPatch, "/users/u1/enable", nil, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.EnableUser(rr, req)
	assert.Equal(t, http.StatusNotFound, rr.Code)
}

func TestEnableUser_Success(t *testing.T) {
	ctrl := newAuthController(&mockAuthService{}, nil)
	req := newMuxRequest(http.MethodPatch, "/users/u1/enable", nil, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.EnableUser(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestEnableUser_ServiceError(t *testing.T) {
	svc := &mockAuthService{enableErr: errors.New("internal")}
	ctrl := newAuthController(svc, nil)
	req := newMuxRequest(http.MethodPatch, "/users/u1/enable", nil, map[string]string{"id": "u1"})
	rr := httptest.NewRecorder()
	ctrl.EnableUser(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- NewController default getSession closure ---

func TestNewController_DefaultGetSession_NilWhenNoSession(t *testing.T) {
	ctrl := NewController(&mockAuthService{}, NewMapper())
	// session.GetSessionFromRequestContext just reads a context key — safe without ST running.
	result := ctrl.getSession(context.Background())
	assert.Nil(t, result)
}

// --- sessionContainerWrapper tests ---

func TestSessionContainerWrapper(t *testing.T) {
	called := false
	sc := &sessmodels.TypeSessionContainer{
		GetUserID: func() string { return "uid-123" },
		RevokeSession: func() error {
			called = true
			return nil
		},
	}
	w := &sessionContainerWrapper{sc: sc}
	assert.Equal(t, "uid-123", w.GetUserID())
	err := w.RevokeSession()
	assert.NoError(t, err)
	assert.True(t, called)
}
