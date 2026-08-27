package middleware

import (
	"net/http"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"go_backend/src/logger"
)

// Trace extracts or generates trace/span IDs and scopes a logger into the request context.
func Trace(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		traceID := r.Header.Get("X-Trace-Id")
		if _, err := uuid.Parse(traceID); err != nil {
			traceID = uuid.New().String()
		}
		spanID := uuid.New().String()

		scopedLogger := zap.L().With(
			zap.String("trace_id", traceID),
			zap.String("span_id", spanID),
		)

		ctx := logger.WithLogger(r.Context(), scopedLogger)
		ctx = logger.WithTraceID(ctx, traceID, spanID)

		w.Header().Set("X-Span-Id", spanID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
