import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { Datasource } from "./datasource";
import { Service } from "./service";
import { Controller } from "./controller";
import { registerRoutes } from "./routes";

describe("health service", () => {
  it("reports ok with the node-backend service info", () => {
    const svc = new Service(new Datasource());
    const health = svc.getHealth();
    expect(health.status).toBe("ok");
    expect(health.service).toBe("node-backend");
    expect(health.version).toBe("1.0.0");
  });
});

describe("GET /health", () => {
  it("returns 200 with a JSON health payload", async () => {
    const app = express();
    app.use(registerRoutes());
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("health controller", () => {
  it("responds 200 via the controller directly", () => {
    const ctrl = new Controller(new Service(new Datasource()));
    const app = express();
    app.get("/health", ctrl.getHealth);
    return request(app).get("/health").expect(200);
  });
});
