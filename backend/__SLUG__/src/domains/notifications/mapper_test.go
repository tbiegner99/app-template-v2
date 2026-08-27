package notifications

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLogToResponse_Fields(t *testing.T) {
	l := NotificationLog{
		ID:               42,
		UserID:           "user1",
		DeviceToken:      "tok",
		NotificationType: "alert",
		Title:            "Hello",
		Body:             "World",
		DataPayload:      map[string]interface{}{"key": "val"},
		Status:           "sent",
		FCMMessageID:     "fcm-id",
		ErrorMessage:     "",
		DateCreated:      "2024-01-01T00:00:00Z",
		SentAt:           "2024-01-01T00:00:01Z",
	}
	resp := logToResponse(l)
	assert.Equal(t, 42, resp["id"])
	assert.Equal(t, "user1", resp["user_id"])
	assert.Equal(t, "tok", resp["device_token"])
	assert.Equal(t, "alert", resp["notification_type"])
	assert.Equal(t, "Hello", resp["title"])
	assert.Equal(t, "World", resp["body"])
	assert.Equal(t, "sent", resp["status"])
	assert.Equal(t, "fcm-id", resp["fcm_message_id"])
	assert.Nil(t, resp["error_message"])
	assert.Equal(t, "2024-01-01T00:00:01Z", resp["sent_at"])
}

func TestLogToResponse_NilDataPayload(t *testing.T) {
	l := NotificationLog{
		DataPayload: nil,
		Title:       "",
		Body:        "",
	}
	resp := logToResponse(l)
	assert.Nil(t, resp["title"])
	assert.Nil(t, resp["body"])
	assert.Nil(t, resp["data_payload"])
}

func TestNullableString_Empty(t *testing.T) {
	assert.Nil(t, nullableString(""))
}

func TestNullableString_NonEmpty(t *testing.T) {
	assert.Equal(t, "foo", nullableString("foo"))
}
