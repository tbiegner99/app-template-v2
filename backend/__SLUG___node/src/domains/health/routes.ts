import { Router } from "express";
import { Datasource } from "./datasource";
import { Service } from "./service";
import { Controller } from "./controller";

/** Initializes the health domain and returns a configured router. */
export function registerRoutes(): Router {
  const datasource = new Datasource();
  const service = new Service(datasource);
  const controller = new Controller(service);

  const router = Router();
  router.get("/health", controller.getHealth);
  return router;
}
