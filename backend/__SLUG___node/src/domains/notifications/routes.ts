import { Router } from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import type { Controller } from "./controller";

export function registerRoutes(controller: Controller): Router {
  const router = Router();

  // Device-token routes require an authenticated session
  const tokenRouter = Router();
  tokenRouter.use(verifySession());
  tokenRouter.post("/v1/notifications/device-tokens", controller.registerToken);
  tokenRouter.delete("/v1/notifications/device-tokens/:token", controller.deleteToken);
  router.use(tokenRouter);

  router.post("/v1/notifications/send", controller.send);
  router.get("/v1/notifications/logs", controller.getLogs);

  return router;
}
