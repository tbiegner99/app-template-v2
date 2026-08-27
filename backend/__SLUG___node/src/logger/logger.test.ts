import { describe, expect, it } from "vitest";
import {
  gcpLevelEncoder,
  loggerFromContext,
  spanIdFromContext,
  traceIdFromContext,
  withRequestContext,
} from "./logger";
import pino from "pino";

describe("gcpLevelEncoder", () => {
  it.each([
    ["debug", "DEBUG"],
    ["info", "INFO"],
    ["warn", "WARNING"],
    ["error", "ERROR"],
    ["fatal", "CRITICAL"],
  ])("maps %s to %s", (level, expected) => {
    expect(gcpLevelEncoder(level)).toBe(expected);
  });

  it("defaults unknown levels to DEFAULT", () => {
    expect(gcpLevelEncoder("silent")).toBe("DEFAULT");
  });
});

describe("request context", () => {
  it("falls back to a non-null logger with no active context", () => {
    expect(loggerFromContext()).toBeTruthy();
  });

  it("returns empty trace/span ids with no active context", () => {
    expect(traceIdFromContext()).toBe("");
    expect(spanIdFromContext()).toBe("");
  });

  it("round-trips logger, traceId, and spanId through the async context", () => {
    const scoped = pino({ level: "silent" });
    withRequestContext({ logger: scoped, traceId: "trace-123", spanId: "span-456" }, () => {
      expect(loggerFromContext()).toBe(scoped);
      expect(traceIdFromContext()).toBe("trace-123");
      expect(spanIdFromContext()).toBe("span-456");
    });
  });
});
