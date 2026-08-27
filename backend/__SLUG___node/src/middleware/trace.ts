import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { getRootLogger, withRequestContext } from "../logger/logger";

/** Extracts or generates trace/span IDs and scopes a logger into the request's async context. */
export function trace(req: Request, res: Response, next: NextFunction): void {
  const headerTraceId = req.header("X-Trace-Id") ?? "";
  const traceId = uuidValidate(headerTraceId) ? headerTraceId : uuidv4();
  const spanId = uuidv4();

  const scopedLogger = getRootLogger().child({ trace_id: traceId, span_id: spanId });

  res.setHeader("X-Span-Id", spanId);

  withRequestContext({ logger: scopedLogger, traceId, spanId }, () => {
    next();
  });
}
