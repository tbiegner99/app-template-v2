package testapi

import (
	"context"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go_backend/src/logger"
)

func TestDeleteApplicationUser_Found(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	ldb := logger.NewLoggingDB(db)
	ds := NewDatasource(ldb)

	mock.ExpectQuery(`DELETE FROM users WHERE id`).
		WithArgs("app-id-1").
		WillReturnRows(sqlmock.NewRows([]string{"supertokens_id"}).AddRow("st-id-1"))

	stID, err := ds.DeleteApplicationUser(context.Background(), "app-id-1")
	require.NoError(t, err)
	assert.Equal(t, "st-id-1", stID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteApplicationUser_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	ldb := logger.NewLoggingDB(db)
	ds := NewDatasource(ldb)

	mock.ExpectQuery(`DELETE FROM users WHERE id`).
		WithArgs("missing-id").
		WillReturnRows(sqlmock.NewRows([]string{"supertokens_id"}))

	_, err = ds.DeleteApplicationUser(context.Background(), "missing-id")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "user not found")
	assert.NoError(t, mock.ExpectationsWereMet())
}
