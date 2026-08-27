package notifications

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/supertokens/supertokens-golang/recipe/session"
	sessmodels "github.com/supertokens/supertokens-golang/recipe/session/sessmodels"
	"go.uber.org/zap"
	"go_backend/src/domains/auth"
	"go_backend/src/logger"
)

type authUserResolver interface {
	ResolveApplicationUser(ctx context.Context, supertokensID string) (*auth.ApplicationUser, error)
}

type sessionContainerIface interface {
	GetUserID() string
}

type Controller struct {
	svc        *Service
	authSvc    authUserResolver
	getSession func(ctx context.Context) sessionContainerIface
}

func NewController(svc *Service, authSvc authUserResolver) *Controller {
	return &Controller{
		svc:     svc,
		authSvc: authSvc,
		getSession: func(ctx context.Context) sessionContainerIface {
			sc := session.GetSessionFromRequestContext(ctx)
			if sc == nil {
				return nil
			}
			return &notifSessionWrapper{sc: sc}
		},
	}
}

type notifSessionWrapper struct {
	sc sessmodels.SessionContainer
}

func (w *notifSessionWrapper) GetUserID() string { return w.sc.GetUserID() }

// resolveUserID extracts the SuperTokens user ID from the session, then resolves it to the app user ID.
func (c *Controller) resolveUserID(r *http.Request, w http.ResponseWriter) (string, bool) {
	sc := c.getSession(r.Context())
	if sc == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return "", false
	}
	appUser, err := c.authSvc.ResolveApplicationUser(r.Context(), sc.GetUserID())
	if err != nil {
		logger.LoggerFromContext(r.Context()).Error("resolve user error",
			zap.String("supertokens_id", sc.GetUserID()),
			zap.Error(err),
		)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return "", false
	}
	return appUser.ID, true
}

func (c *Controller) RegisterToken(w http.ResponseWriter, r *http.Request) {
	userID, ok := c.resolveUserID(r, w)
	if !ok {
		return
	}

	var req RegisterTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Token == "" || req.Platform == "" || req.PlatformVersion == "" || req.AppVersion == "" || req.DeviceID == "" {
		http.Error(w, "token, platform, platform_version, app_version, and device_id are required", http.StatusBadRequest)
		return
	}
	if req.Platform != "ios" && req.Platform != "android" {
		http.Error(w, "invalid platform", http.StatusBadRequest)
		return
	}

	id, err := c.svc.RegisterToken(r.Context(), userID, &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"id": id})
}

func (c *Controller) DeleteToken(w http.ResponseWriter, r *http.Request) {
	userID, ok := c.resolveUserID(r, w)
	if !ok {
		return
	}
	token := mux.Vars(r)["token"]

	if err := c.svc.DeleteToken(r.Context(), userID, token); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (c *Controller) Send(w http.ResponseWriter, r *http.Request) {
	var req SendNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if len(req.UserIDs) == 0 {
		http.Error(w, "user_ids must not be empty", http.StatusBadRequest)
		return
	}
	if req.Type != "alert" && req.Type != "data" {
		http.Error(w, "type must be alert or data", http.StatusBadRequest)
		return
	}
	if req.Type == "alert" && (req.Title == "" || req.Body == "") {
		http.Error(w, "title and body required for alert type", http.StatusBadRequest)
		return
	}

	resp, err := c.svc.Send(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(resp)
}

func (c *Controller) GetLogs(w http.ResponseWriter, r *http.Request) {
	userID, ok := c.resolveUserID(r, w)
	if !ok {
		return
	}
	// TODO: derive isAdmin from session roles once role support is wired
	isAdmin := false

	q := r.URL.Query()
	limit, _ := strconv.Atoi(q.Get("limit"))
	offset, _ := strconv.Atoi(q.Get("offset"))

	filter := LogQueryFilter{
		UserID: q.Get("user_id"),
		Status: q.Get("status"),
		From:   q.Get("from"),
		To:     q.Get("to"),
		Limit:  limit,
		Offset: offset,
	}

	resp, err := c.svc.GetLogs(r.Context(), userID, isAdmin, filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	results := make([]map[string]interface{}, len(resp.Results))
	for i, l := range resp.Results {
		results[i] = logToResponse(l)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"total":   resp.Total,
		"results": results,
	})
}
