package notifications

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/supertokens/supertokens-golang/recipe/session/sessmodels"
	"go_backend/src/domains/auth"
)

func RegisterRoutes(r *mux.Router, c *Controller) {
	// Device-token routes require an authenticated session
	tokenRouter := r.PathPrefix("/v1/notifications/device-tokens").Subrouter()
	tokenRouter.Use(auth.VerifySession(&sessmodels.VerifySessionOptions{
		SessionRequired: boolPtr(true),
	}))
	tokenRouter.HandleFunc("", c.RegisterToken).Methods(http.MethodPost)
	tokenRouter.HandleFunc("/{token}", c.DeleteToken).Methods(http.MethodDelete)

	r.HandleFunc("/v1/notifications/send", c.Send).Methods(http.MethodPost)
	r.HandleFunc("/v1/notifications/logs", c.GetLogs).Methods(http.MethodGet)
}

func boolPtr(b bool) *bool {
	return &b
}
