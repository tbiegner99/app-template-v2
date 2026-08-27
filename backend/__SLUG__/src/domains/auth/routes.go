package auth

import (
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/supertokens/supertokens-golang/recipe/session"
	"github.com/supertokens/supertokens-golang/recipe/session/sessmodels"
	"github.com/supertokens/supertokens-golang/recipe/userroles"
	"go_backend/src/logger"
)

// RegisterRoutes initializes the auth domain and returns a configured subrouter.
func RegisterRoutes(db logger.Database) *mux.Router {
	datasource := NewDatasource(db)
	service := NewService(datasource)
	mapper := NewMapper()
	controller := NewController(service, mapper)

	subrouter := mux.NewRouter()

	// Public routes
	subrouter.HandleFunc("/signin", controller.SignIn).Methods(http.MethodPost)
	subrouter.HandleFunc("/signout", controller.SignOut).Methods(http.MethodPost)

	// Signup requires either an authenticated admin session or a valid
	// system-actor key (for bootstrapping the first user / scripted setup).
	adminOnly := subrouter.NewRoute().Subrouter()
	adminOnly.Use(RequireSystemActorOrAdmin)
	adminOnly.HandleFunc("/signup", controller.SignUp).Methods(http.MethodPost)

	// Protected routes
	protected := subrouter.NewRoute().Subrouter()
	protected.Use(VerifySession(&sessmodels.VerifySessionOptions{
		SessionRequired: boolPtr(true),
	}))
	protected.HandleFunc("/me", controller.GetMe).Methods(http.MethodGet)
	protected.HandleFunc("/change-password", controller.ChangePassword).Methods(http.MethodPatch)
	protected.HandleFunc("/users/list", controller.ListUsers).Methods(http.MethodPost)
	protected.HandleFunc("/users/{id}", controller.UpdateUser).Methods(http.MethodPatch)
	protected.HandleFunc("/users/{id}/password", controller.AdminResetPassword).Methods(http.MethodPatch)
	protected.HandleFunc("/users/{id}/disable", controller.DisableUser).Methods(http.MethodPatch)
	protected.HandleFunc("/users/{id}/enable", controller.EnableUser).Methods(http.MethodPatch)

	return subrouter
}

// VerifySession creates middleware that verifies a SuperTokens session.
// Exported so other domains can apply it to their own routers.
func VerifySession(options *sessmodels.VerifySessionOptions) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return session.VerifySession(options, func(w http.ResponseWriter, r *http.Request) {
			next.ServeHTTP(w, r)
		})
	}
}

// RequireSystemActorOrAdmin allows a request through if either:
//   - it carries a valid X-System-Actor-Key header matching the
//     SYSTEM_ACTOR_KEY env var (for bootstrap/scripted setup), or
//   - it has an authenticated session belonging to a user with the
//     "admin" role.
//
// SYSTEM_ACTOR_KEY should be unset (or rotated) once bootstrap is done —
// it's a standing credential, not a one-time-use token.
func RequireSystemActorOrAdmin(next http.Handler) http.Handler {
	sessionGuarded := VerifySession(&sessmodels.VerifySessionOptions{
		SessionRequired: boolPtr(true),
	})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sc := session.GetSessionFromRequestContext(r.Context())
		if sc == nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		rolesResp, err := userroles.GetRolesForUser("public", sc.GetUserID())
		if err != nil || rolesResp.OK == nil || !hasRole(rolesResp.OK.Roles, "admin") {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	}))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := os.Getenv("SYSTEM_ACTOR_KEY")
		if key != "" && r.Header.Get("X-System-Actor-Key") == key {
			next.ServeHTTP(w, r)
			return
		}
		sessionGuarded.ServeHTTP(w, r)
	})
}

func hasRole(roles []string, role string) bool {
	for _, r := range roles {
		if r == role {
			return true
		}
	}
	return false
}

func boolPtr(b bool) *bool {
	return &b
}
