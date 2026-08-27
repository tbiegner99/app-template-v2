import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requestLog } from "./requestLog";

describe("requestLog middleware", () => {
  it("calls next and returns the response untouched", async () => {
    let called = false;
    const app = express();
    app.use(requestLog);
    app.get("/", (_req, res) => {
      called = true;
      res.sendStatus(200);
    });
    const res = await request(app).get("/");
    expect(called).toBe(true);
    expect(res.status).toBe(200);
  });

  it("passes through non-2xx statuses", async () => {
    const app = express();
    app.use(requestLog);
    app.get("/", (_req, res) => res.sendStatus(404));
    const res = await request(app).get("/");
    expect(res.status).toBe(404);
  });
});
