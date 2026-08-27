package auth

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/supertokens/supertokens-golang/recipe/session"
	sessmodels "github.com/supertokens/supertokens-golang/recipe/session/sessmodels"
	"go.uber.org/zap"
	"go_backend/src/logger"
	"go_backend/src/shared/pagination"
)

type authService interface {
	SignUp(ctx context.Context, req *SignUpRequest, displayName string, roles []string) (*ApplicationUser, error)
	SignIn(ctx context.Context, req *SignInRequest) (string, error)
	ResolveApplicationUser(ctx context.Context, supertokensID string) (*ApplicationUser, error)
	GetUser(userID string) (*User, error)
	ChangePassword(ctx context.Context, email, oldPassword, newPassword string) error
	ListUsers(ctx context.Context, params pagination.Params) (pagination.PagedResponse[ApplicationUser], error)
	UpdateUser(ctx context.Context, id, email, displayName string, roles []string) (*ApplicationUser, error)
	AdminResetPassword(ctx context.Context, userID, newPassword string) error
	DisableUser(ctx context.Context, adminSupertokensID, targetID string) error
	EnableUser(ctx context.Context, id string) error
}

type sessionContainer interface {
	GetUserID() string
	RevokeSession() error
}

// Controller handles HTTP interactions for auth domain.
type Controller struct {
	service       authService
	mapper        *Mapper
	getSession    func(ctx context.Context) sessionContainer
	createSession func(r *http.Request, w http.ResponseWriter, userID string, claims map[string]interface{}) error
}

type sessionContainerWrapper struct {
	sc sessmodels.SessionContainer
}

func (w *sessionContainerWrapper) GetUserID() string  { return w.sc.GetUserID() }
func (w *sessionContainerWrapper) RevokeSession() error { return w.sc.RevokeSession() }

// NewController creates a new controller instance.
func NewController(service authService, mapper *Mapper) *Controller {
	return &Controller{
		service: service,
		mapper:  mapper,
		getSession: func(ctx context.Context) sessionContainer {
			sc := session.GetSessionFromRequestContext(ctx)
			if sc == nil {
				return nil
			}
			return &sessionContainerWrapper{sc: sc}
		},
		createSession: func(r *http.Request, w http.ResponseWriter, userID string, claims map[string]interface{}) error {
			_, err := session.CreateNewSession(r, w, "public", userID, claims, map[string]interface{}{})
			return err
		},
	}
}

// SignUp handles POST /signup requests.
func (c *Controller) SignUp(w http.ResponseWriter, r *http.Request) {
	var dto SignUpRequestDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid request body")
		return
	}
	if dto.DisplayName == "" {
		dto.DisplayName = dto.Email
	}

	req := &SignUpRequest{Email: dto.Email, Password: dto.Password}
	appUser, err := c.service.SignUp(r.Context(), req, dto.DisplayName, dto.Roles)
	if err != nil {
		if _, ok := err.(*EmailAlreadyExistsError); ok {
			writeError(w, r, http.StatusConflict, err.Error())
			return
		}
		logger.LoggerFromContext(r.Context()).Error("signup error", zap.Error(err))
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}

	err = c.createSession(r, w, appUser.SupertokensID, map[string]interface{}{
		"userId": appUser.ID,
	})
	if err != nil {
		logger.LoggerFromContext(r.Context()).Error("session creation error", zap.Error(err))
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c.mapper.ApplicationUserToDTO(appUser))
}

// SignIn handles POST /signin requests.
func (c *Controller) SignIn(w http.ResponseWriter, r *http.Request) {
	var dto SignInRequestDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid request body")
		return
	}

	req := c.mapper.SignInRequestToModel(&dto)
	supertokensID, err := c.service.SignIn(r.Context(), req)
	if err != nil {
		if _, ok := err.(*WrongCredentialsError); ok {
			writeError(w, r, http.StatusUnauthorized, err.Error())
			return
		}
		logger.LoggerFromContext(r.Context()).Error("signin error", zap.Error(err))
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}

	appUser, err := c.service.ResolveApplicationUser(r.Context(), supertokensID)
	if err != nil {
		logger.LoggerFromContext(r.Context()).Error("resolve user error",
			zap.String("supertokens_id", supertokensID),
			zap.Error(err),
		)
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}

	err = c.createSession(r, w, supertokensID, map[string]interface{}{
		"userId": appUser.ID,
	})
	if err != nil {
		logger.LoggerFromContext(r.Context()).Error("session creation error", zap.Error(err))
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c.mapper.ApplicationUserToDTO(appUser))
}

// SignOut handles POST /signout requests.
func (c *Controller) SignOut(w http.ResponseWriter, r *http.Request) {
	sessionContainer := c.getSession(r.Context())
	if sessionContainer != nil {
		if err := sessionContainer.RevokeSession(); err != nil {
			logger.LoggerFromContext(r.Context()).Error("signout error", zap.Error(err))
			writeError(w, r, http.StatusInternalServerError, "internal server error")
			return
		}
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "signed out successfully"})
}

// GetMe handles GET /me requests (protected).
func (c *Controller) GetMe(w http.ResponseWriter, r *http.Request) {
	supertokensID := c.supertokensIDFromContext(r.Context(), w, r)
	if supertokensID == "" {
		return
	}
	appUser, err := c.service.ResolveApplicationUser(r.Context(), supertokensID)
	if err != nil {
		logger.LoggerFromContext(r.Context()).Error("get me error",
			zap.String("supertokens_id", supertokensID),
			zap.Error(err),
		)
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c.mapper.ApplicationUserToDTO(appUser))
}

// ChangePassword handles PATCH /change-password (protected).
func (c *Controller) ChangePassword(w http.ResponseWriter, r *http.Request) {
	supertokensID := c.supertokensIDFromContext(r.Context(), w, r)
	if supertokensID == "" {
		return
	}

	var dto ChangePasswordRequestDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid request body")
		return
	}
	if dto.OldPassword == "" || dto.NewPassword == "" {
		writeError(w, r, http.StatusBadRequest, "oldPassword and newPassword are required")
		return
	}

	appUser, err := c.service.ResolveApplicationUser(r.Context(), supertokensID)
	if err != nil {
		logger.LoggerFromContext(r.Context()).Error("resolve user error",
			zap.String("supertokens_id", supertokensID),
			zap.Error(err),
		)
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}

	req := c.mapper.ChangePasswordRequestToModel(&dto)
	if err := c.service.ChangePassword(r.Context(), appUser.Email, req.OldPassword, req.NewPassword); err != nil {
		if _, ok := err.(*WrongCredentialsError); ok {
			writeError(w, r, http.StatusBadRequest, "old password is incorrect")
			return
		}
		logger.LoggerFromContext(r.Context()).Error("change password error",
			zap.String("supertokens_id", supertokensID),
			zap.Error(err),
		)
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
}

// ListUsers handles POST /users/list (protected).
func (c *Controller) ListUsers(w http.ResponseWriter, r *http.Request) {
	params, err := pagination.Decode(r)
	if err != nil {
		writeError(w, r, http.StatusBadRequest, err.Error())
		return
	}
	result, err := c.service.ListUsers(r.Context(), params)
	if err != nil {
		if _, ok := err.(*pagination.InvalidFieldError); ok {
			writeError(w, r, http.StatusBadRequest, err.Error())
			return
		}
		logger.LoggerFromContext(r.Context()).Error("list users error", zap.Error(err))
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c.mapper.ApplicationUserPageToDTO(result))
}

// UpdateUser handles PATCH /users/{id} (protected).
func (c *Controller) UpdateUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var dto UpdateUserRequestDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid request body")
		return
	}
	appUser, err := c.service.UpdateUser(r.Context(), id, dto.Email, dto.DisplayName, dto.Roles)
	if err != nil {
		if _, ok := err.(*UserNotFoundError); ok {
			writeError(w, r, http.StatusNotFound, err.Error())
			return
		}
		if _, ok := err.(*EmailAlreadyExistsError); ok {
			writeError(w, r, http.StatusConflict, err.Error())
			return
		}
		logger.LoggerFromContext(r.Context()).Error("update user error",
			zap.String("user_id", id),
			zap.Error(err),
		)
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c.mapper.ApplicationUserToDTO(appUser))
}

// AdminResetPassword handles PATCH /users/{id}/password (protected).
func (c *Controller) AdminResetPassword(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var dto AdminResetPasswordRequestDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid request body")
		return
	}
	if dto.NewPassword == "" {
		writeError(w, r, http.StatusBadRequest, "newPassword is required")
		return
	}
	if err := c.service.AdminResetPassword(r.Context(), id, dto.NewPassword); err != nil {
		if _, ok := err.(*UserNotFoundError); ok {
			writeError(w, r, http.StatusNotFound, err.Error())
			return
		}
		logger.LoggerFromContext(r.Context()).Error("admin reset password error",
			zap.String("user_id", id),
			zap.Error(err),
		)
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
}

// DisableUser handles PATCH /users/{id}/disable (protected).
func (c *Controller) DisableUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	adminSupertokensID := c.supertokensIDFromContext(r.Context(), w, r)
	if adminSupertokensID == "" {
		return
	}
	if err := c.service.DisableUser(r.Context(), adminSupertokensID, id); err != nil {
		if _, ok := err.(*SelfDisableError); ok {
			writeError(w, r, http.StatusBadRequest, err.Error())
			return
		}
		if _, ok := err.(*UserNotFoundError); ok {
			writeError(w, r, http.StatusNotFound, err.Error())
			return
		}
		logger.LoggerFromContext(r.Context()).Error("disable user error",
			zap.String("user_id", id),
			zap.Error(err),
		)
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
}

// EnableUser handles PATCH /users/{id}/enable (protected).
func (c *Controller) EnableUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := c.service.EnableUser(r.Context(), id); err != nil {
		if _, ok := err.(*UserNotFoundError); ok {
			writeError(w, r, http.StatusNotFound, err.Error())
			return
		}
		logger.LoggerFromContext(r.Context()).Error("enable user error",
			zap.String("user_id", id),
			zap.Error(err),
		)
		writeError(w, r, http.StatusInternalServerError, "internal server error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
}

func writeError(w http.ResponseWriter, r *http.Request, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"error":    msg,
		"trace_id": logger.TraceIDFromContext(r.Context()),
	})
}

func (c *Controller) supertokensIDFromContext(ctx context.Context, w http.ResponseWriter, r *http.Request) string {
	sessionContainer := c.getSession(ctx)
	if sessionContainer == nil {
		writeError(w, r, http.StatusUnauthorized, "unauthorized")
		return ""
	}
	return sessionContainer.GetUserID()
}
