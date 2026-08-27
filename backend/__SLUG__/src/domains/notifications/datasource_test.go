package notifications

import (
	"context"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go_backend/src/logger"
)

func newMockDS(t *testing.T) (*Datasource, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	t.Cleanup(func() { db.Close() })
	ldb := logger.NewLoggingDB(db)
	return NewDatasource(ldb), mock
}

func TestUpsertDeviceToken(t *testing.T) {
	ds, mock := newMockDS(t)
	mock.ExpectQuery(`INSERT INTO device_tokens`).
		WithArgs("u1", "tok1", "ios", "16.0", "1.0", "dev1", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(5))

	id, err := ds.UpsertDeviceToken(context.Background(), &DeviceToken{
		UserID: "u1", Token: "tok1", Platform: "ios",
		PlatformVersion: "16.0", AppVersion: "1.0", DeviceID: "dev1",
	})
	require.NoError(t, err)
	assert.Equal(t, 5, id)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteDeviceToken(t *testing.T) {
	ds, mock := newMockDS(t)
	mock.ExpectExec(`DELETE FROM device_tokens WHERE user_id`).
		WithArgs("u1", "tok1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	err := ds.DeleteDeviceToken(context.Background(), "u1", "tok1")
	require.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteDeviceTokenByValue(t *testing.T) {
	ds, mock := newMockDS(t)
	mock.ExpectExec(`DELETE FROM device_tokens WHERE token`).
		WithArgs("tok1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	err := ds.DeleteDeviceTokenByValue(context.Background(), "tok1")
	require.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetTokensByUserID(t *testing.T) {
	ds, mock := newMockDS(t)
	rows := sqlmock.NewRows([]string{"id", "user_id", "token", "platform", "platform_version", "app_version", "device_id", "date_created", "last_modified"}).
		AddRow(1, "u1", "tok1", "ios", "16.0", "1.0", "dev1", "2024-01-01", "2024-01-02")
	mock.ExpectQuery(`SELECT .* FROM device_tokens WHERE user_id`).
		WithArgs("u1").
		WillReturnRows(rows)

	tokens, err := ds.GetTokensByUserID(context.Background(), "u1")
	require.NoError(t, err)
	require.Len(t, tokens, 1)
	assert.Equal(t, "tok1", tokens[0].Token)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetTokensByUserID_Empty(t *testing.T) {
	ds, mock := newMockDS(t)
	rows := sqlmock.NewRows([]string{"id", "user_id", "token", "platform", "platform_version", "app_version", "device_id", "date_created", "last_modified"})
	mock.ExpectQuery(`SELECT .* FROM device_tokens WHERE user_id`).
		WithArgs("u1").
		WillReturnRows(rows)

	tokens, err := ds.GetTokensByUserID(context.Background(), "u1")
	require.NoError(t, err)
	assert.Empty(t, tokens)
}

func TestInsertNotificationLog(t *testing.T) {
	ds, mock := newMockDS(t)
	mock.ExpectQuery(`INSERT INTO notification_logs`).
		WithArgs("u1", "tok1", "alert", "title", "body", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(10))

	log := &NotificationLog{
		UserID: "u1", DeviceToken: "tok1", NotificationType: "alert",
		Title: "title", Body: "body",
		DataPayload: map[string]interface{}{},
	}
	id, err := ds.InsertNotificationLog(context.Background(), log)
	require.NoError(t, err)
	assert.Equal(t, 10, id)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateNotificationLogStatus(t *testing.T) {
	ds, mock := newMockDS(t)
	mock.ExpectExec(`UPDATE notification_logs SET status`).
		WithArgs("sent", "fcm-123", "", sqlmock.AnyArg(), 10).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err := ds.UpdateNotificationLogStatus(context.Background(), 10, "sent", "fcm-123", "")
	require.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetNotificationLogs_NoFilter(t *testing.T) {
	ds, mock := newMockDS(t)
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM notification_logs`).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	cols := []string{"id", "user_id", "device_token", "notification_type", "title", "body", "data_payload", "status", "fcm_message_id", "error_message", "date_created", "sent_at"}
	rows := sqlmock.NewRows(cols).AddRow(1, "u1", "tok1", "alert", "t", "b", `{"type":"alert"}`, "sent", "fcm1", "", "2024-01-01", "2024-01-01")
	mock.ExpectQuery(`SELECT .* FROM notification_logs`).
		WillReturnRows(rows)

	logs, total, err := ds.GetNotificationLogs(context.Background(), LogQueryFilter{})
	require.NoError(t, err)
	assert.Equal(t, 1, total)
	assert.Len(t, logs, 1)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetNotificationLogs_WithFilters(t *testing.T) {
	ds, mock := newMockDS(t)
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM notification_logs WHERE`).
		WithArgs("u1", "sent").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery(`SELECT .* FROM notification_logs WHERE`).
		WithArgs("u1", "sent", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "device_token", "notification_type", "title", "body", "data_payload", "status", "fcm_message_id", "error_message", "date_created", "sent_at"}))

	filter := LogQueryFilter{UserID: "u1", Status: "sent"}
	_, _, err := ds.GetNotificationLogs(context.Background(), filter)
	require.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}
