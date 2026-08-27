package middleware

import (
	"net/http"
	"time"

	"github.com/felixge/httpsnoop"
	"go.uber.org/zap"
	"go_backend/src/logger"
)

// RequestLog logs method, path, status, and duration for every request.
func RequestLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		metrics := httpsnoop.CaptureMetrics(next, w, r)
		logger.LoggerFromContext(r.Context()).Debug("request complete",
			zap.String("method", r.Method),
			zap.String("path", r.URL.Path),
			zap.Int("status", metrics.Code),
			zap.Int64("duration_ms", time.Since(start).Milliseconds()),
		)
	})
}
