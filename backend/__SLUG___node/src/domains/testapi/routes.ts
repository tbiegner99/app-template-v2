import { Router } from "express";
import type { Database } from "../../logger/db";
import { PgDatasource } from "./datasource";
import { Service } from "./service";
import { Controller } from "./controller";

/**
 * Registers test-only routes. Routes are always registered; access is
 * controlled by the X-Test-Api-Key header.
 */
export function registerRoutes(db: Database): Router {
  const ds = new PgDatasource(db);
  const svc = new Service(ds);
  const ctrl = new Controller(svc);

  const router = Router();
  router.delete("/test/users", ctrl.deleteUsers);
  return router;
}
