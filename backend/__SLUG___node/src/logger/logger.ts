import pino, { type Logger } from "pino";
import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  logger: Logger;
  traceId: string;
  spanId: string;
}

const als = new AsyncLocalStorage<RequestContext>();

const gcpLevelMap: Record<string, string> = {
  trace: "DEBUG",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARNING",
  error: "ERROR",
  fatal: "CRITICAL",
};

/** Maps pino levels to GCP Cloud Logging severity strings, defaulting to DEFAULT for unknown levels. */
export function gcpLevelEncoder(level: string): string {
  return gcpLevelMap[level] ?? "DEFAULT";
}

let rootLogger: Logger = pino({ level: "info" });

export function initLogger(): void {
  const level = process.env.LOG_LEVEL === "debug" ? "debug" : "info";

  if (process.env.LOG_PRETTY === "true") {
    rootLogger = pino({
      level,
      transport: { target: "pino-pretty" },
    });
    return;
  }

  rootLogger = pino({
    level,
    messageKey: "message",
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { severity: gcpLevelEncoder(label) };
      },
    },
  });
}

export function withRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return als.run(ctx, fn);
}

export function loggerFromContext(): Logger {
  return als.getStore()?.logger ?? rootLogger;
}

export function traceIdFromContext(): string {
  return als.getStore()?.traceId ?? "";
}

export function spanIdFromContext(): string {
  return als.getStore()?.spanId ?? "";
}

export function getRootLogger(): Logger {
  return rootLogger;
}
