CREATE TABLE device_tokens (
    id               SERIAL      PRIMARY KEY,
    user_id          TEXT        NOT NULL,
    token            TEXT        NOT NULL,
    platform         TEXT        NOT NULL,
    platform_version TEXT        NOT NULL,
    app_version      TEXT        NOT NULL,
    device_id        TEXT        NOT NULL,
    date_created     TEXT        NOT NULL,
    last_modified    TEXT        NOT NULL,
    UNIQUE (token)
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens (user_id);
