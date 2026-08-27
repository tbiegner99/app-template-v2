import { Router, type NextFunction, type Response } from "express";
import type { SessionRequest } from "supertokens-node/framework/express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import UserRoles from "supertokens-node/recipe/userroles";
import type { Database } from "../../logger/db";
import { Datasource } from "./datasource";
import { Service } from "./service";
import { Controller } from "./controller";

/**
 * Allows a request through if either:
 *  - it carries a valid X-System-Actor-Key header matching the SYSTEM_ACTOR_KEY
 *    env var (for bootstrap/scripted setup), or
 *  - it has an authenticated session belonging to a user with the "admin" role.
 *
 * SYSTEM_ACTOR_KEY should be unset (or rotated) once bootstrap is done — it's a
 * standing credential, not a one-time-use token.
 */
function requireSystemActorOrAdmin(req: SessionRequest, res: Response, next: NextFunction): void {
  const key = process.env.SYSTEM_ACTOR_KEY;
  if (key && req.header("X-System-Actor-Key") === key) {
    next();
    return;
  }
  verifySession()(req, res, async () => {
    const session = req.session;
    if (!session) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      const rolesResp = await UserRoles.getRolesForUser("public", session.getUserId());
      if (!rolesResp.roles.includes("admin")) {
        res.status(403).json({ error: "forbidden" });
        return;
      }
      next();
    } catch {
      res.status(403).json({ error: "forbidden" });
    }
  });
}

/** Initializes the auth domain and returns a configured router. */
export function registerRoutes(db: Database): Router {
  const datasource = new Datasource(db);
  const service = new Service(datasource);
  const controller = new Controller(service);

  const router = Router();

  // Public routes
  router.post("/signin", controller.signIn);
  router.post("/signout", controller.signOut);

  // Signup requires either an authenticated admin session or a valid
  // system-actor key (for bootstrapping the first user / scripted setup).
  router.post("/signup", requireSystemActorOrAdmin, controller.signUp);

  // Protected routes
  router.get("/me", verifySession(), controller.getMe);
  router.patch("/change-password", verifySession(), controller.changePassword);
  router.post("/users/list", verifySession(), controller.listUsers);
  router.patch("/users/:id", verifySession(), controller.updateUser);
  router.patch("/users/:id/password", verifySession(), controller.adminResetPassword);
  router.patch("/users/:id/disable", verifySession(), controller.disableUser);
  router.patch("/users/:id/enable", verifySession(), controller.enableUser);

  return router;
}
