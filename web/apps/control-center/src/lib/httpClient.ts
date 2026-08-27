let currentTraceId = '';

export function setTraceId(id: string): void {
  currentTraceId = id;
}

export function getTraceId(): string {
  return currentTraceId;
}

export class ApiError extends Error {
  traceId: string;
  status: number;

  constructor(message: string, traceId: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.traceId = traceId;
    this.status = status;
  }
}

export async function httpClient(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (currentTraceId) {
    headers.set('X-Trace-Id', currentTraceId);
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let traceId = currentTraceId;
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.clone().json();
      if (body.error) message = body.error;
      if (body.trace_id) traceId = body.trace_id;
    } catch {
      // non-JSON error body — use defaults
    }
    throw new ApiError(message, traceId, res.status);
  }

  return res;
}
