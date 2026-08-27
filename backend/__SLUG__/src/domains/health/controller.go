package health

import (
	"encoding/json"
	"net/http"

	"go.uber.org/zap"
	"go_backend/src/logger"
)

// Controller handles HTTP interactions for health domain
type Controller struct {
	service *Service
	mapper  *Mapper
}

// NewController creates a new controller instance
func NewController(service *Service, mapper *Mapper) *Controller {
	return &Controller{
		service: service,
		mapper:  mapper,
	}
}

// GetHealth handles GET /health requests
func (c *Controller) GetHealth(w http.ResponseWriter, r *http.Request) {
	// Get health from service (business logic layer)
	health, err := c.service.GetHealth()
	if err != nil {
		logger.LoggerFromContext(r.Context()).Error("health check error", zap.Error(err))
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	dto := c.mapper.ToDTO(health)

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(dto); err != nil {
		logger.LoggerFromContext(r.Context()).Error("health encode error", zap.Error(err))
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
}
