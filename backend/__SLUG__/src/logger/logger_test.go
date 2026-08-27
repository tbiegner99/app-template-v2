package logger

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func TestWithLogger_RoundTrip(t *testing.T) {
	l, _ := zap.NewNop().Named("test"), error(nil)
	ctx := WithLogger(context.Background(), l)
	got := LoggerFromContext(ctx)
	assert.Equal(t, l, got)
}

func TestLoggerFromContext_Empty(t *testing.T) {
	got := LoggerFromContext(context.Background())
	require.NotNil(t, got)
}

func TestWithTraceID_RoundTrip(t *testing.T) {
	ctx := WithTraceID(context.Background(), "trace-123", "span-456")
	assert.Equal(t, "trace-123", TraceIDFromContext(ctx))
	assert.Equal(t, "span-456", SpanIDFromContext(ctx))
}

func TestTraceIDFromContext_Empty(t *testing.T) {
	assert.Equal(t, "", TraceIDFromContext(context.Background()))
}

func TestSpanIDFromContext_Empty(t *testing.T) {
	assert.Equal(t, "", SpanIDFromContext(context.Background()))
}

func TestGCPLevelEncoder(t *testing.T) {
	cases := []struct {
		level    zapcore.Level
		expected string
	}{
		{zapcore.DebugLevel, "DEBUG"},
		{zapcore.InfoLevel, "INFO"},
		{zapcore.WarnLevel, "WARNING"},
		{zapcore.ErrorLevel, "ERROR"},
		{zapcore.DPanicLevel, "CRITICAL"},
		{zapcore.PanicLevel, "CRITICAL"},
		{zapcore.FatalLevel, "CRITICAL"},
	}
	for _, tc := range cases {
		t.Run(tc.level.String(), func(t *testing.T) {
			var buf fakeEncoder
			gcpLevelEncoder(tc.level, &buf)
			assert.Equal(t, tc.expected, buf.value)
		})
	}
}

func TestGCPLevelEncoder_Unknown(t *testing.T) {
	var buf fakeEncoder
	gcpLevelEncoder(zapcore.Level(99), &buf)
	assert.Equal(t, "DEFAULT", buf.value)
}

type fakeEncoder struct {
	value string
}

func (f *fakeEncoder) AppendBool(bool)             {}
func (f *fakeEncoder) AppendByteString([]byte)     {}
func (f *fakeEncoder) AppendComplex128(complex128) {}
func (f *fakeEncoder) AppendComplex64(complex64)   {}
func (f *fakeEncoder) AppendFloat64(float64)       {}
func (f *fakeEncoder) AppendFloat32(float32)       {}
func (f *fakeEncoder) AppendInt(int)               {}
func (f *fakeEncoder) AppendInt64(int64)           {}
func (f *fakeEncoder) AppendInt32(int32)           {}
func (f *fakeEncoder) AppendInt16(int16)           {}
func (f *fakeEncoder) AppendInt8(int8)             {}
func (f *fakeEncoder) AppendString(s string)       { f.value = s }
func (f *fakeEncoder) AppendUint(uint)             {}
func (f *fakeEncoder) AppendUint64(uint64)         {}
func (f *fakeEncoder) AppendUint32(uint32)         {}
func (f *fakeEncoder) AppendUint16(uint16)         {}
func (f *fakeEncoder) AppendUint8(uint8)           {}
func (f *fakeEncoder) AppendUintptr(uintptr)       {}
