package health

import "time"

// Health represents the business model for system health status
type Health struct {
	Status    string
	Timestamp time.Time
	Service   string
	Version   string
}
