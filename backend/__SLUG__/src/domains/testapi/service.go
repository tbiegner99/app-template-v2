package testapi

import (
	"context"

	"github.com/supertokens/supertokens-golang/supertokens"
)

// Datasource is satisfied by any type that can delete application users.
type Datasource interface {
	DeleteApplicationUser(ctx context.Context, id string) (supertokensID string, err error)
}

// Service handles test-only business logic.
type Service struct {
	datasource Datasource
}

// NewService creates a new test service.
func NewService(datasource Datasource) *Service {
	return &Service{datasource: datasource}
}

// DeleteUsers removes each user from both the application users table and SuperTokens.
// It returns the count of users successfully deleted from the application table.
func (s *Service) DeleteUsers(ctx context.Context, ids []string) (int, error) {
	deleted := 0
	for _, id := range ids {
		supertokensID, err := s.datasource.DeleteApplicationUser(ctx, id)
		if err != nil {
			continue
		}
		// Best-effort SuperTokens cleanup
		_ = supertokens.DeleteUser(supertokensID)
		deleted++
	}
	return deleted, nil
}
