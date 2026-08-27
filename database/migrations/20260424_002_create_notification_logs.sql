CREATE TABLE notification_logs (
    id                SERIAL      PRIMARY KEY,
    user_id           TEXT        NOT NULL,
    device_token      TEXT        NOT NULL,
    notification_type TEXT        NOT NULL,
    title             TEXT,
    body              TEXT,
    data_payload      JSONB,
    status            TEXT        NOT NULL DEFAULT 'pending',
    fcm_message_id    TEXT,
    error_message     TEXT,
    date_created      TEXT        NOT NULL,
    sent_at           TEXT
);

CREATE INDEX idx_notification_logs_user_id_date ON notification_logs (user_id, date_created DESC);
