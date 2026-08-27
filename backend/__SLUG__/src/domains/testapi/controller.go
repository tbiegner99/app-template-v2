package testapi

import (
	"encoding/json"
	"net/http"
	"os"
)

// Controller handles test-only HTTP requests.
type Controller struct {
	service *Service
}

// NewController creates a new test API controller.
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

type deleteUsersRequest struct {
	IDs []string `json:"ids"`
}

type deleteUsersResponse struct {
	Deleted int `json:"deleted"`
}

// DeleteUsers deletes a batch of users from SuperTokens and the users table.
func (c *Controller) DeleteUsers(w http.ResponseWriter, r *http.Request) {
	apiKey := os.Getenv("TEST_API_KEY")
	if apiKey == "" || r.Header.Get("X-Test-Api-Key") != apiKey {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "forbidden"})
		return
	}

	var req deleteUsersRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.IDs) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	deleted, err := c.service.DeleteUsers(r.Context(), req.IDs)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "internal server error"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(deleteUsersResponse{Deleted: deleted})
}
