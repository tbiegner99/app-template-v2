package testapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestController() *Controller {
	ds := &mockDatasource{
		results: map[string]string{"user1": "st-id-1", "user2": "st-id-2"},
	}
	return NewController(NewService(ds))
}

func TestDeleteUsers_MissingAPIKey(t *testing.T) {
	os.Setenv("TEST_API_KEY", "secret")
	ctrl := newTestController()
	req := httptest.NewRequest(http.MethodPost, "/delete-users", bytes.NewBufferString(`{"ids":["user1"]}`))
	rr := httptest.NewRecorder()
	ctrl.DeleteUsers(rr, req)
	assert.Equal(t, http.StatusForbidden, rr.Code)
}

func TestDeleteUsers_WrongAPIKey(t *testing.T) {
	os.Setenv("TEST_API_KEY", "secret")
	ctrl := newTestController()
	req := httptest.NewRequest(http.MethodPost, "/delete-users", bytes.NewBufferString(`{"ids":["user1"]}`))
	req.Header.Set("X-Test-Api-Key", "wrong")
	rr := httptest.NewRecorder()
	ctrl.DeleteUsers(rr, req)
	assert.Equal(t, http.StatusForbidden, rr.Code)
}

func TestDeleteUsers_EmptyIDs(t *testing.T) {
	os.Setenv("TEST_API_KEY", "secret")
	ctrl := newTestController()
	req := httptest.NewRequest(http.MethodPost, "/delete-users", bytes.NewBufferString(`{"ids":[]}`))
	req.Header.Set("X-Test-Api-Key", "secret")
	rr := httptest.NewRecorder()
	ctrl.DeleteUsers(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestDeleteUsers_InvalidJSON(t *testing.T) {
	os.Setenv("TEST_API_KEY", "secret")
	ctrl := newTestController()
	req := httptest.NewRequest(http.MethodPost, "/delete-users", bytes.NewBufferString(`not json`))
	req.Header.Set("X-Test-Api-Key", "secret")
	rr := httptest.NewRecorder()
	ctrl.DeleteUsers(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestDeleteUsers_Success(t *testing.T) {
	os.Setenv("TEST_API_KEY", "secret")
	ctrl := newTestController()
	body, _ := json.Marshal(map[string][]string{"ids": {"user1", "user2"}})
	req := httptest.NewRequest(http.MethodPost, "/delete-users", bytes.NewBuffer(body))
	req.Header.Set("X-Test-Api-Key", "secret")
	rr := httptest.NewRecorder()
	ctrl.DeleteUsers(rr, req)
	require.Equal(t, http.StatusOK, rr.Code)
	var resp deleteUsersResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	assert.Equal(t, 2, resp.Deleted)
}
