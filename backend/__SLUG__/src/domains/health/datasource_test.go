package health

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetSystemInfo(t *testing.T) {
	ds := NewDatasource()
	svc, ver, err := ds.GetSystemInfo()
	require.NoError(t, err)
	assert.Equal(t, "go-backend", svc)
	assert.Equal(t, "1.0.0", ver)
}
