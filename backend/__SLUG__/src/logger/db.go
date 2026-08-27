package logger

import (
	"context"
	"database/sql"
	"time"

	"go.uber.org/zap"
)

// Database is the interface datasources depend on instead of *sql.DB directly.
type Database interface {
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
}

// LoggingDB wraps *sql.DB and logs the duration of every query.
type LoggingDB struct {
	db *sql.DB
}

// NewLoggingDB wraps a *sql.DB with query duration logging.
func NewLoggingDB(db *sql.DB) *LoggingDB {
	return &LoggingDB{db: db}
}

func (l *LoggingDB) QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
	start := time.Now()
	rows, err := l.db.QueryContext(ctx, query, args...)
	LoggerFromContext(ctx).Debug("sql query",
		zap.String("query", query),
		zap.Int64("duration_ms", time.Since(start).Milliseconds()),
	)
	return rows, err
}

func (l *LoggingDB) QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row {
	start := time.Now()
	row := l.db.QueryRowContext(ctx, query, args...)
	LoggerFromContext(ctx).Debug("sql query",
		zap.String("query", query),
		zap.Int64("duration_ms", time.Since(start).Milliseconds()),
	)
	return row
}

func (l *LoggingDB) ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error) {
	start := time.Now()
	result, err := l.db.ExecContext(ctx, query, args...)
	LoggerFromContext(ctx).Debug("sql query",
		zap.String("query", query),
		zap.Int64("duration_ms", time.Since(start).Milliseconds()),
	)
	return result, err
}
