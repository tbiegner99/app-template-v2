package health

import (
	"time"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMapper_ToDTO(t *testing.T) {
	m := NewMapper()
	ts := time.Now()
	h := &Health{Status: "ok", Timestamp: ts, Service: "svc", Version: "1.0"}
	dto := m.ToDTO(h)
	assert.Equal(t, "ok", dto.Status)
	assert.Equal(t, ts, dto.Timestamp)
	assert.Equal(t, "svc", dto.Service)
	assert.Equal(t, "1.0", dto.Version)
}

func TestMapper_ToModel(t *testing.T) {
	m := NewMapper()
	ts := time.Now()
	dto := &HealthDTO{Status: "ok", Timestamp: ts, Service: "svc", Version: "1.0"}
	h := m.ToModel(dto)
	assert.Equal(t, "ok", h.Status)
	assert.Equal(t, ts, h.Timestamp)
}

func TestMapper_RoundTrip(t *testing.T) {
	m := NewMapper()
	ts := time.Now()
	h := &Health{Status: "ok", Timestamp: ts, Service: "s", Version: "v"}
	result := m.ToModel(m.ToDTO(h))
	assert.Equal(t, h.Status, result.Status)
	assert.Equal(t, h.Service, result.Service)
	assert.Equal(t, h.Version, result.Version)
}
