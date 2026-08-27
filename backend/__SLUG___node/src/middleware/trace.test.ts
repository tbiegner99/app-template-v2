import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { validate as uuidValidate } from "uuid";
import { trace } from "./trace";
import { traceIdFromContext } from "../logger/logger";

function buildApp(handler: (req: express.Request, res: express.Response) => void) {
  const app = express();
  app.use(trace);
  app.get("/", handler);
  return app;
}

describe("trace middleware", () => {
  it("generates a valid X-Span-Id header", async () => {
    const app = buildApp((_req, res) => res.sendStatus(200));
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(uuidValidate(res.header["x-span-id"])).toBe(true);
  });

  it("preserves a valid incoming X-Trace-Id", async () => {
    const traceId = "9c858901-8a57-4791-81fe-4c455b099bc9";
    let captured = "";
    const app = buildApp((_req, res) => {
      captured = traceIdFromContext();
      res.sendStatus(200);
    });
    await request(app).get("/").set("X-Trace-Id", traceId);
    expect(captured).toBe(traceId);
  });

  it("generates a new trace id when the incoming one is invalid", async () => {
    let captured = "";
    const app = buildApp((_req, res) => {
      captured = traceIdFromContext();
      res.sendStatus(200);
    });
    await request(app).get("/").set("X-Trace-Id", "not-a-uuid");
    expect(uuidValidate(captured)).toBe(true);
  });

  it("generates a trace id when none is provided", async () => {
    let captured = "";
    const app = buildApp((_req, res) => {
      captured = traceIdFromContext();
      res.sendStatus(200);
    });
    await request(app).get("/");
    expect(uuidValidate(captured)).toBe(true);
  });
});
