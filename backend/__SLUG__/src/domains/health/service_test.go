package health

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetHealth_ReturnsOK(t *testing.T) {
	ds := NewDatasource()
	svc := NewService(ds)
	h, err := svc.GetHealth()
	require.NoError(t, err)
	assert.Equal(t, "ok", h.Status)
	assert.Equal(t, "go-backend", h.Service)
	assert.Equal(t, "1.0.0", h.Version)
}
