package health

import (
	"net/http"

	"github.com/gorilla/mux"
)

// RegisterRoutes initializes the health domain and returns a configured subrouter
func RegisterRoutes() *mux.Router {
	// Initialize domain components
	datasource := NewDatasource()
	service := NewService(datasource)
	mapper := NewMapper()
	controller := NewController(service, mapper)

	// Create subrouter
	subrouter := mux.NewRouter()
	subrouter.HandleFunc("/health", controller.GetHealth).Methods(http.MethodGet)

	return subrouter
}
