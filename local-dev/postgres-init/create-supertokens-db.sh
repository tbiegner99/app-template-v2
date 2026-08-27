#!/bin/bash
# Runs once, only when the postgres data volume is first initialized.
# Creates a separate database for SuperTokens so `__SLUG__ reset-db` (which
# drops and recreates $POSTGRES_DB) never touches auth/session/user data.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "${POSTGRES_DB}_supertokens";
EOSQL
