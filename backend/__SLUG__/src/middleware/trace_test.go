package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go_backend/src/logger"
)

func TestTrace_GeneratesSpanID(t *testing.T) {
	handler := Trace(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	spanID := rr.Header().Get("X-Span-Id")
	assert.NotEmpty(t, spanID)
	_, err := uuid.Parse(spanID)
	assert.NoError(t, err)
}

func TestTrace_PreservesValidTraceID(t *testing.T) {
	traceID := uuid.New().String()
	var capturedTraceID string
	handler := Trace(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedTraceID = logger.TraceIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Trace-Id", traceID)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	assert.Equal(t, traceID, capturedTraceID)
}

func TestTrace_GeneratesNewTraceIDForInvalid(t *testing.T) {
	var capturedTraceID string
	handler := Trace(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedTraceID = logger.TraceIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Trace-Id", "not-a-uuid")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	require.NotEmpty(t, capturedTraceID)
	_, err := uuid.Parse(capturedTraceID)
	assert.NoError(t, err)
}

func TestTrace_SetsLoggerInContext(t *testing.T) {
	var loggerPresent bool
	handler := Trace(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		l := logger.LoggerFromContext(r.Context())
		loggerPresent = l != nil
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	assert.True(t, loggerPresent)
}

func TestTrace_MissingTraceIDGetsNewUUID(t *testing.T) {
	var capturedTraceID string
	handler := Trace(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedTraceID = logger.TraceIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	require.NotEmpty(t, capturedTraceID)
	_, err := uuid.Parse(capturedTraceID)
	assert.NoError(t, err)
}
