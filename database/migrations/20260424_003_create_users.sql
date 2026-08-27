CREATE TABLE users (
    id TEXT NOT NULL PRIMARY KEY,
    supertokens_id TEXT NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    date_created TEXT NOT NULL,
    last_modified TEXT NOT NULL,
    UNIQUE (supertokens_id),
    UNIQUE (email)
);

CREATE INDEX idx_users_supertokens_id ON users (supertokens_id);
CREATE INDEX idx_users_email ON users (email);
