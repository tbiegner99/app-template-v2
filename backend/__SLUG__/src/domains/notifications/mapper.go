package notifications

func logToResponse(l NotificationLog) map[string]interface{} {
	return map[string]interface{}{
		"id":                l.ID,
		"user_id":           l.UserID,
		"device_token":      l.DeviceToken,
		"notification_type": l.NotificationType,
		"title":             nullableString(l.Title),
		"body":              nullableString(l.Body),
		"data_payload":      l.DataPayload,
		"status":            l.Status,
		"fcm_message_id":    nullableString(l.FCMMessageID),
		"error_message":     nullableString(l.ErrorMessage),
		"date_created":      l.DateCreated,
		"sent_at":           nullableString(l.SentAt),
	}
}

func nullableString(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
