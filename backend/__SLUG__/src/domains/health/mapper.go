package health

import "time"

// HealthDTO represents the data transfer object for API responses
type HealthDTO struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Service   string    `json:"service"`
	Version   string    `json:"version"`
}

// Mapper handles conversions between domain models and DTOs
type Mapper struct{}

// NewMapper creates a new mapper instance
func NewMapper() *Mapper {
	return &Mapper{}
}

// ToDTO converts a Health model to a HealthDTO
func (m *Mapper) ToDTO(health *Health) *HealthDTO {
	return &HealthDTO{
		Status:    health.Status,
		Timestamp: health.Timestamp,
		Service:   health.Service,
		Version:   health.Version,
	}
}

// ToModel converts a HealthDTO to a Health model
func (m *Mapper) ToModel(dto *HealthDTO) *Health {
	return &Health{
		Status:    dto.Status,
		Timestamp: dto.Timestamp,
		Service:   dto.Service,
		Version:   dto.Version,
	}
}
