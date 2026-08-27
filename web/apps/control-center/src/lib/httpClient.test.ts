import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpClient, ApiError, setTraceId, getTraceId } from './httpClient';

describe('traceId helpers', () => {
  it('sets and gets trace id', () => {
    setTraceId('abc-123');
    expect(getTraceId()).toBe('abc-123');
    setTraceId('');
  });
});

describe('ApiError', () => {
  it('has correct properties', () => {
    const err = new ApiError('bad', 'trace-1', 404);
    expect(err.message).toBe('bad');
    expect(err.traceId).toBe('trace-1');
    expect(err.status).toBe(404);
    expect(err.name).toBe('ApiError');
  });
});

describe('httpClient', () => {
  beforeEach(() => {
    setTraceId('');
    vi.restoreAllMocks();
  });

  it('returns response on success', async () => {
    const mockRes = new Response('ok', { status: 200 });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockRes);
    const res = await httpClient('/api/test');
    expect(res.status).toBe(200);
  });

  it('includes X-Trace-Id header when traceId set', async () => {
    setTraceId('trace-xyz');
    let capturedHeaders: Headers | undefined;
    vi.spyOn(global, 'fetch').mockImplementationOnce((_url, opts) => {
      capturedHeaders = opts?.headers as Headers;
      return Promise.resolve(new Response('ok', { status: 200 }));
    });
    await httpClient('/api/test');
    expect(capturedHeaders?.get('X-Trace-Id')).toBe('trace-xyz');
    setTraceId('');
  });

  it('throws ApiError on non-ok response with JSON body', async () => {
    const body = JSON.stringify({ error: 'Not found', trace_id: 'trace-err' });
    const mockRes = new Response(body, { status: 404, headers: { 'Content-Type': 'application/json' } });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockRes);
    await expect(httpClient('/api/test')).rejects.toThrow(ApiError);
  });

  it('throws ApiError with default message on non-JSON error body', async () => {
    const mockRes = new Response('plain error', { status: 500 });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockRes);
    try {
      await httpClient('/api/test');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(500);
    }
  });
});
