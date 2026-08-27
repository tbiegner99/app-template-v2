package notifications

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
	"github.com/stretchr/testify/require"
	sessmodels "github.com/supertokens/supertokens-golang/recipe/session/sessmodels"
	"go_backend/src/domains/auth"
)

// --- mock auth resolver ---

type mockAuthResolver struct {
	user *auth.ApplicationUser
	err  error
}

func (m *mockAuthResolver) ResolveApplicationUser(ctx context.Context, supertokensID string) (*auth.ApplicationUser, error) {
	return m.user, m.err
}

// --- mock session ---

type mockNotifSession struct {
	userID string
}

func (m *mockNotifSession) GetUserID() string { return m.userID }

// --- helpers ---

func muxSetVars(r *http.Request, vars map[string]string) *http.Request {
	return mux.SetURLVars(r, vars)
}

func newNotifController(sessionUserID string, authUser *auth.ApplicationUser, authErr error) *Controller {
	ds := &mockNotifDS{tokens: []DeviceToken{}, insertLogID: 1}
	svc := NewService(ds, &mockFCM{messageID: "mid"})
	authSvc := &mockAuthResolver{user: authUser, err: authErr}
	ctrl := NewController(svc, authSvc)
	if sessionUserID == "" {
		ctrl.getSession = func(ctx context.Context) sessionContainerIface { return nil }
	} else {
		ctrl.getSession = func(ctx context.Context) sessionContainerIface {
			return &mockNotifSession{userID: sessionUserID}
		}
	}
	return ctrl
}

// --- tests ---

func TestSendController_ValidAlert(t *testing.T) {
	ctrl := newNotifController("", nil, nil)
	body, _ := json.Marshal(SendNotificationRequest{
		Type: "alert", UserIDs: []string{"u1"}, Title: "T", Body: "B",
	})
	req := httptest.NewRequest(http.MethodPost, "/send", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.Send(rr, req)
	assert.Equal(t, http.StatusAccepted, rr.Code)
}

func TestSendController_MissingUserIDs(t *testing.T) {
	ctrl := newNotifController("", nil, nil)
	body, _ := json.Marshal(SendNotificationRequest{Type: "data"})
	req := httptest.NewRequest(http.MethodPost, "/send", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.Send(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestSendController_InvalidType(t *testing.T) {
	ctrl := newNotifController("", nil, nil)
	body, _ := json.Marshal(SendNotificationRequest{Type: "push", UserIDs: []string{"u1"}})
	req := httptest.NewRequest(http.MethodPost, "/send", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.Send(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestSendController_AlertMissingTitle(t *testing.T) {
	ctrl := newNotifController("", nil, nil)
	body, _ := json.Marshal(SendNotificationRequest{Type: "alert", UserIDs: []string{"u1"}, Body: "b"})
	req := httptest.NewRequest(http.MethodPost, "/send", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.Send(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestSendController_InvalidJSON(t *testing.T) {
	ctrl := newNotifController("", nil, nil)
	req := httptest.NewRequest(http.MethodPost, "/send", bytes.NewBufferString("not json"))
	rr := httptest.NewRecorder()
	ctrl.Send(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestRegisterTokenController_Unauthorized(t *testing.T) {
	ctrl := newNotifController("", nil, nil)
	req := httptest.NewRequest(http.MethodPost, "/tokens", bytes.NewBufferString("{}"))
	rr := httptest.NewRecorder()
	ctrl.RegisterToken(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}

func TestRegisterTokenController_MissingFields(t *testing.T) {
	user := &auth.ApplicationUser{ID: "app-id-1"}
	ctrl := newNotifController("st-id-1", user, nil)
	body, _ := json.Marshal(RegisterTokenRequest{Token: "tok"}) // missing platform etc.
	req := httptest.NewRequest(http.MethodPost, "/tokens", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.RegisterToken(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestRegisterTokenController_InvalidPlatform(t *testing.T) {
	user := &auth.ApplicationUser{ID: "app-id-1"}
	ctrl := newNotifController("st-id-1", user, nil)
	body, _ := json.Marshal(RegisterTokenRequest{
		Token: "tok", Platform: "windows", PlatformVersion: "11", AppVersion: "1.0", DeviceID: "d1",
	})
	req := httptest.NewRequest(http.MethodPost, "/tokens", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.RegisterToken(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestRegisterTokenController_Success(t *testing.T) {
	user := &auth.ApplicationUser{ID: "app-id-1"}
	ds := &mockNotifDS{upsertTokenID: 3}
	svc := NewService(ds, &mockFCM{})
	authSvc := &mockAuthResolver{user: user}
	ctrl := NewController(svc, authSvc)
	ctrl.getSession = func(ctx context.Context) sessionContainerIface {
		return &mockNotifSession{userID: "st-id-1"}
	}
	body, _ := json.Marshal(RegisterTokenRequest{
		Token: "tok", Platform: "ios", PlatformVersion: "16", AppVersion: "1.0", DeviceID: "d1",
	})
	req := httptest.NewRequest(http.MethodPost, "/tokens", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.RegisterToken(rr, req)
	require.Equal(t, http.StatusOK, rr.Code)
}

func TestGetLogsController_Unauthorized(t *testing.T) {
	ctrl := newNotifController("", nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/logs", nil)
	rr := httptest.NewRecorder()
	ctrl.GetLogs(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}

func TestDeleteTokenController_Unauthorized(t *testing.T) {
	ctrl := newNotifController("", nil, nil)
	req := httptest.NewRequest(http.MethodDelete, "/tokens/tok1", nil)
	rr := httptest.NewRecorder()
	ctrl.DeleteToken(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}

// --- NewController default getSession closure ---

func TestNewController_DefaultGetSession_NilWhenNoSession(t *testing.T) {
	ctrl := NewController(NewService(&mockNotifDS{}, &mockFCM{}), &mockAuthResolver{})
	// session.GetSessionFromRequestContext just reads a context key — safe without ST running.
	result := ctrl.getSession(context.Background())
	assert.Nil(t, result)
}

// --- resolveUserID error path ---

func TestResolveUserID_AuthServiceError(t *testing.T) {
	ctrl := newNotifController("st-id-1", nil, errors.New("db error"))
	body, _ := json.Marshal(RegisterTokenRequest{
		Token: "tok", Platform: "ios", PlatformVersion: "16", AppVersion: "1.0", DeviceID: "d1",
	})
	req := httptest.NewRequest(http.MethodPost, "/tokens", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	ctrl.RegisterToken(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- notifSessionWrapper tests ---

func TestNotifSessionWrapper_GetUserID(t *testing.T) {
	sc := &sessmodels.TypeSessionContainer{
		GetUserID: func() string { return "notif-uid" },
	}
	w := &notifSessionWrapper{sc: sc}
	assert.Equal(t, "notif-uid", w.GetUserID())
}

// --- GetLogs tests ---

func TestGetLogsController_Success(t *testing.T) {
	ds := &mockNotifDS{
		logs:     []NotificationLog{{ID: 1, UserID: "app-id-1"}},
		logsTotal: 1,
	}
	svc := NewService(ds, &mockFCM{})
	user := &auth.ApplicationUser{ID: "app-id-1"}
	authSvc := &mockAuthResolver{user: user}
	ctrl := NewController(svc, authSvc)
	ctrl.getSession = func(ctx context.Context) sessionContainerIface {
		return &mockNotifSession{userID: "st-id-1"}
	}
	req := httptest.NewRequest(http.MethodGet, "/logs?limit=10&offset=0", nil)
	rr := httptest.NewRecorder()
	ctrl.GetLogs(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)
}

func TestGetLogsController_ServiceError(t *testing.T) {
	ds := &mockNotifDS{logsErr: errors.New("db error")}
	svc := NewService(ds, &mockFCM{})
	user := &auth.ApplicationUser{ID: "app-id-1"}
	authSvc := &mockAuthResolver{user: user}
	ctrl := NewController(svc, authSvc)
	ctrl.getSession = func(ctx context.Context) sessionContainerIface {
		return &mockNotifSession{userID: "st-id-1"}
	}
	req := httptest.NewRequest(http.MethodGet, "/logs", nil)
	rr := httptest.NewRecorder()
	ctrl.GetLogs(rr, req)
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
}

// --- DeleteToken tests ---

func TestDeleteTokenController_Success(t *testing.T) {
	user := &auth.ApplicationUser{ID: "app-id-1"}
	ds := &mockNotifDS{}
	svc := NewService(ds, &mockFCM{})
	authSvc := &mockAuthResolver{user: user}
	ctrl := NewController(svc, authSvc)
	ctrl.getSession = func(ctx context.Context) sessionContainerIface {
		return &mockNotifSession{userID: "st-id-1"}
	}
	req := httptest.NewRequest(http.MethodDelete, "/tokens/my-token", nil)
	req = muxSetVars(req, map[string]string{"token": "my-token"})
	rr := httptest.NewRecorder()
	ctrl.DeleteToken(rr, req)
	assert.Equal(t, http.StatusNoContent, rr.Code)
}
