package notifications

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"go_backend/src/logger"
)

type Datasource struct {
	db logger.Database
}

func NewDatasource(db logger.Database) *Datasource {
	return &Datasource{db: db}
}

func (d *Datasource) UpsertDeviceToken(ctx context.Context, t *DeviceToken) (int, error) {
	now := time.Now().UTC().Format(time.RFC3339)
	var id int
	err := d.db.QueryRowContext(ctx, `
		INSERT INTO device_tokens (user_id, token, platform, platform_version, app_version, device_id, date_created, last_modified)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (token) DO UPDATE SET
			user_id = EXCLUDED.user_id,
			platform_version = EXCLUDED.platform_version,
			app_version = EXCLUDED.app_version,
			device_id = EXCLUDED.device_id,
			last_modified = EXCLUDED.last_modified
		RETURNING id`,
		t.UserID, t.Token, t.Platform, t.PlatformVersion, t.AppVersion, t.DeviceID, now, now,
	).Scan(&id)
	return id, err
}

func (d *Datasource) DeleteDeviceToken(ctx context.Context, userID, token string) error {
	_, err := d.db.ExecContext(ctx,
		`DELETE FROM device_tokens WHERE user_id = $1 AND token = $2`,
		userID, token,
	)
	return err
}

func (d *Datasource) DeleteDeviceTokenByValue(ctx context.Context, token string) error {
	_, err := d.db.ExecContext(ctx, `DELETE FROM device_tokens WHERE token = $1`, token)
	return err
}

func (d *Datasource) GetTokensByUserID(ctx context.Context, userID string) ([]DeviceToken, error) {
	rows, err := d.db.QueryContext(ctx,
		`SELECT id, user_id, token, platform, platform_version, app_version, device_id, date_created, last_modified
		 FROM device_tokens WHERE user_id = $1`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tokens []DeviceToken
	for rows.Next() {
		var t DeviceToken
		if err := rows.Scan(&t.ID, &t.UserID, &t.Token, &t.Platform, &t.PlatformVersion, &t.AppVersion, &t.DeviceID, &t.DateCreated, &t.LastModified); err != nil {
			return nil, err
		}
		tokens = append(tokens, t)
	}
	return tokens, rows.Err()
}

func (d *Datasource) InsertNotificationLog(ctx context.Context, log *NotificationLog) (int, error) {
	payload, err := json.Marshal(log.DataPayload)
	if err != nil {
		return 0, err
	}
	now := time.Now().UTC().Format(time.RFC3339)
	var id int
	err = d.db.QueryRowContext(ctx, `
		INSERT INTO notification_logs (user_id, device_token, notification_type, title, body, data_payload, status, date_created)
		VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
		RETURNING id`,
		log.UserID, log.DeviceToken, log.NotificationType, log.Title, log.Body, string(payload), now,
	).Scan(&id)
	return id, err
}

func (d *Datasource) UpdateNotificationLogStatus(ctx context.Context, id int, status, fcmMessageID, errMsg string) error {
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := d.db.ExecContext(ctx,
		`UPDATE notification_logs SET status = $1, fcm_message_id = $2, error_message = $3, sent_at = $4 WHERE id = $5`,
		status, fcmMessageID, errMsg, now, id,
	)
	return err
}

func (d *Datasource) GetNotificationLogs(ctx context.Context, filter LogQueryFilter) ([]NotificationLog, int, error) {
	conditions := []string{}
	args := []interface{}{}
	argIdx := 1

	if filter.UserID != "" {
		conditions = append(conditions, fmt.Sprintf("user_id = $%d", argIdx))
		args = append(args, filter.UserID)
		argIdx++
	}
	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, filter.Status)
		argIdx++
	}
	if filter.From != "" {
		conditions = append(conditions, fmt.Sprintf("date_created >= $%d", argIdx))
		args = append(args, filter.From)
		argIdx++
	}
	if filter.To != "" {
		conditions = append(conditions, fmt.Sprintf("date_created <= $%d", argIdx))
		args = append(args, filter.To)
		argIdx++
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	var total int
	countArgs := make([]interface{}, len(args))
	copy(countArgs, args)
	if err := d.db.QueryRowContext(ctx, fmt.Sprintf("SELECT COUNT(*) FROM notification_logs %s", where), countArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	limit := filter.Limit
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	args = append(args, limit, filter.Offset)
	query := fmt.Sprintf(
		`SELECT id, user_id, device_token, notification_type, title, body, data_payload, status, fcm_message_id, error_message, date_created, sent_at
		 FROM notification_logs %s ORDER BY date_created DESC LIMIT $%d OFFSET $%d`,
		where, argIdx, argIdx+1,
	)

	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var logs []NotificationLog
	for rows.Next() {
		var l NotificationLog
		var payloadStr string
		var title, body, fcmID, errMessage, sentAt sql.NullString
		if err := rows.Scan(&l.ID, &l.UserID, &l.DeviceToken, &l.NotificationType, &title, &body, &payloadStr, &l.Status, &fcmID, &errMessage, &l.DateCreated, &sentAt); err != nil {
			return nil, 0, err
		}
		l.Title = title.String
		l.Body = body.String
		l.FCMMessageID = fcmID.String
		l.ErrorMessage = errMessage.String
		l.SentAt = sentAt.String
		_ = json.Unmarshal([]byte(payloadStr), &l.DataPayload)
		logs = append(logs, l)
	}
	return logs, total, rows.Err()
}
