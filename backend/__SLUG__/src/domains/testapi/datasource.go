package testapi

import (
	"context"
	"database/sql"
	"fmt"

	"go_backend/src/logger"
)

// datasource implements Datasource against the application postgres DB.
type datasource struct {
	db logger.Database
}

// NewDatasource creates a new testapi datasource.
func NewDatasource(db logger.Database) Datasource {
	return &datasource{db: db}
}

// DeleteApplicationUser removes the user row by application ID and returns the supertokens_id.
func (d *datasource) DeleteApplicationUser(ctx context.Context, id string) (string, error) {
	row := d.db.QueryRowContext(ctx,
		`DELETE FROM users WHERE id = $1 RETURNING supertokens_id`, id)
	var supertokensID string
	if err := row.Scan(&supertokensID); err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("user not found: %s", id)
		}
		return "", fmt.Errorf("delete user: %w", err)
	}
	return supertokensID, nil
}
