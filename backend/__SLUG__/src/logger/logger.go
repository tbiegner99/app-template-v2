package logger

import (
	"context"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type contextKey int

const (
	loggerKey  contextKey = iota
	traceIDKey contextKey = iota
	spanIDKey  contextKey = iota
)

func InitLogger() {
	var core zapcore.Core

	level := zapcore.InfoLevel
	if os.Getenv("LOG_LEVEL") == "debug" {
		level = zapcore.DebugLevel
	}

	if os.Getenv("LOG_PRETTY") == "true" {
		encCfg := zap.NewDevelopmentEncoderConfig()
		encCfg.EncodeLevel = zapcore.CapitalColorLevelEncoder
		core = zapcore.NewCore(
			zapcore.NewConsoleEncoder(encCfg),
			zapcore.AddSync(os.Stdout),
			level,
		)
	} else {
		encCfg := zap.NewProductionEncoderConfig()
		encCfg.MessageKey = "message"
		encCfg.LevelKey = "severity"
		encCfg.TimeKey = "time"
		encCfg.EncodeTime = zapcore.RFC3339NanoTimeEncoder
		encCfg.EncodeLevel = gcpLevelEncoder
		core = zapcore.NewCore(
			zapcore.NewJSONEncoder(encCfg),
			zapcore.AddSync(os.Stdout),
			level,
		)
	}

	zap.ReplaceGlobals(zap.New(core))
}

// gcpLevelEncoder maps zap levels to GCP Cloud Logging severity strings.
func gcpLevelEncoder(l zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
	switch l {
	case zapcore.DebugLevel:
		enc.AppendString("DEBUG")
	case zapcore.InfoLevel:
		enc.AppendString("INFO")
	case zapcore.WarnLevel:
		enc.AppendString("WARNING")
	case zapcore.ErrorLevel:
		enc.AppendString("ERROR")
	case zapcore.DPanicLevel, zapcore.PanicLevel, zapcore.FatalLevel:
		enc.AppendString("CRITICAL")
	default:
		enc.AppendString("DEFAULT")
	}
}

// WithLogger stores a scoped logger in the context.
func WithLogger(ctx context.Context, l *zap.Logger) context.Context {
	return context.WithValue(ctx, loggerKey, l)
}

// LoggerFromContext retrieves the scoped logger from context, falling back to the global logger.
func LoggerFromContext(ctx context.Context) *zap.Logger {
	if l, ok := ctx.Value(loggerKey).(*zap.Logger); ok && l != nil {
		return l
	}
	return zap.L()
}

// WithTraceID stores trace and span IDs in the context.
func WithTraceID(ctx context.Context, traceID, spanID string) context.Context {
	ctx = context.WithValue(ctx, traceIDKey, traceID)
	ctx = context.WithValue(ctx, spanIDKey, spanID)
	return ctx
}

// TraceIDFromContext retrieves the trace ID from context.
func TraceIDFromContext(ctx context.Context) string {
	if id, ok := ctx.Value(traceIDKey).(string); ok {
		return id
	}
	return ""
}

// SpanIDFromContext retrieves the span ID from context.
func SpanIDFromContext(ctx context.Context) string {
	if id, ok := ctx.Value(spanIDKey).(string); ok {
		return id
	}
	return ""
}
