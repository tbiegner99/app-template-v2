package testapi

import (
	"net/http"

	"github.com/gorilla/mux"
	"go_backend/src/logger"
)

// RegisterRoutes registers test-only routes on the given router.
// Routes are always registered; access is controlled by the X-Test-Api-Key header.
func RegisterRoutes(apiRouter *mux.Router, db logger.Database) {
	ds := NewDatasource(db)
	svc := NewService(ds)
	ctrl := NewController(svc)

	testRouter := apiRouter.PathPrefix("/test").Subrouter()
	testRouter.HandleFunc("/users", ctrl.DeleteUsers).Methods(http.MethodDelete, http.MethodOptions)
}
