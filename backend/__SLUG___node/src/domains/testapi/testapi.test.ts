import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Datasource } from "./datasource";
import { Service } from "./service";
import { Controller } from "./controller";

vi.mock("supertokens-node", () => ({
  default: { deleteUser: vi.fn().mockResolvedValue(undefined) },
}));

class MockDatasource implements Datasource {
  constructor(
    private readonly results: Record<string, string> = {},
    private readonly errors: Record<string, string> = {},
  ) {}

  async deleteApplicationUser(id: string): Promise<string> {
    if (this.errors[id]) throw new Error(this.errors[id]);
    if (this.results[id]) return this.results[id];
    throw new Error(`user not found: ${id}`);
  }
}

function buildApp(service: Service) {
  const app = express();
  app.use(express.json());
  const ctrl = new Controller(service);
  app.delete("/test/users", ctrl.deleteUsers);
  return app;
}

describe("Service.deleteUsers", () => {
  it("returns 0 for an empty list", async () => {
    const svc = new Service(new MockDatasource());
    expect(await svc.deleteUsers([])).toBe(0);
  });

  it("counts one success", async () => {
    const svc = new Service(new MockDatasource({ id1: "st-id-1" }));
    expect(await svc.deleteUsers(["id1"])).toBe(1);
  });

  it("skips errors and counts the rest", async () => {
    const svc = new Service(new MockDatasource({ id1: "st1" }, { id2: "fail" }));
    expect(await svc.deleteUsers(["id1", "id2", "id3"])).toBe(1);
  });

  it("returns 0 when all fail", async () => {
    const svc = new Service(new MockDatasource({}, { id1: "fail" }));
    expect(await svc.deleteUsers(["id1"])).toBe(0);
  });
});

describe("DELETE /test/users", () => {
  beforeEach(() => {
    process.env.TEST_API_KEY = "secret";
  });

  it("403s with no API key", async () => {
    const app = buildApp(new Service(new MockDatasource({ user1: "st-id-1" })));
    const res = await request(app).delete("/test/users").send({ ids: ["user1"] });
    expect(res.status).toBe(403);
  });

  it("403s with the wrong API key", async () => {
    const app = buildApp(new Service(new MockDatasource({ user1: "st-id-1" })));
    const res = await request(app)
      .delete("/test/users")
      .set("X-Test-Api-Key", "wrong")
      .send({ ids: ["user1"] });
    expect(res.status).toBe(403);
  });

  it("400s on an empty ids list", async () => {
    const app = buildApp(new Service(new MockDatasource()));
    const res = await request(app)
      .delete("/test/users")
      .set("X-Test-Api-Key", "secret")
      .send({ ids: [] });
    expect(res.status).toBe(400);
  });

  it("succeeds and reports the deleted count", async () => {
    const app = buildApp(
      new Service(new MockDatasource({ user1: "st-id-1", user2: "st-id-2" })),
    );
    const res = await request(app)
      .delete("/test/users")
      .set("X-Test-Api-Key", "secret")
      .send({ ids: ["user1", "user2"] });
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(2);
  });
});
