package health

import "time"

// Service contains business logic for health domain
type Service struct {
	datasource *Datasource
}

// NewService creates a new service instance
func NewService(datasource *Datasource) *Service {
	return &Service{
		datasource: datasource,
	}
}

// GetHealth retrieves the current health status with business logic
func (s *Service) GetHealth() (*Health, error) {
	// Business logic: get system info from datasource
	service, version, err := s.datasource.GetSystemInfo()
	if err != nil {
		return nil, err
	}

	// Business logic: determine health status
	status := "ok"
	// Could add more sophisticated health checks here

	return &Health{
		Status:    status,
		Timestamp: time.Now().UTC(),
		Service:   service,
		Version:   version,
	}, nil
}
