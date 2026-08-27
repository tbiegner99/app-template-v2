package testapi

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockDatasource struct {
	results map[string]string
	errors  map[string]error
}

func (m *mockDatasource) DeleteApplicationUser(ctx context.Context, id string) (string, error) {
	if err, ok := m.errors[id]; ok {
		return "", err
	}
	if stID, ok := m.results[id]; ok {
		return stID, nil
	}
	return "", errors.New("user not found: " + id)
}

func TestDeleteUsers_Empty(t *testing.T) {
	svc := NewService(&mockDatasource{})
	count, err := svc.DeleteUsers(context.Background(), []string{})
	require.NoError(t, err)
	assert.Equal(t, 0, count)
}

func TestDeleteUsers_OneSuccess(t *testing.T) {
	ds := &mockDatasource{results: map[string]string{"id1": "st-id-1"}}
	svc := NewService(ds)
	count, err := svc.DeleteUsers(context.Background(), []string{"id1"})
	require.NoError(t, err)
	assert.Equal(t, 1, count)
}

func TestDeleteUsers_SkipsErrors(t *testing.T) {
	ds := &mockDatasource{
		results: map[string]string{"id1": "st1"},
		errors:  map[string]error{"id2": errors.New("fail")},
	}
	svc := NewService(ds)
	count, err := svc.DeleteUsers(context.Background(), []string{"id1", "id2", "id3"})
	require.NoError(t, err)
	assert.Equal(t, 1, count)
}

func TestDeleteUsers_AllFail(t *testing.T) {
	ds := &mockDatasource{
		errors: map[string]error{"id1": errors.New("fail")},
	}
	svc := NewService(ds)
	count, err := svc.DeleteUsers(context.Background(), []string{"id1"})
	require.NoError(t, err)
	assert.Equal(t, 0, count)
}
