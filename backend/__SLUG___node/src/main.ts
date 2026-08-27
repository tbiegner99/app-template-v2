import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { Pool } from "pg";
import supertokens from "supertokens-node";
import { middleware as supertokensMiddleware, errorHandler as supertokensErrorHandler } from "supertokens-node/framework/express";
import Dashboard from "supertokens-node/recipe/dashboard";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import UserRoles from "supertokens-node/recipe/userroles";
import admin from "firebase-admin";

import { initLogger, getRootLogger } from "./logger/logger";
import { LoggingDB } from "./logger/db";
import { trace } from "./middleware/trace";
import { requestLog } from "./middleware/requestLog";

import * as health from "./domains/health/routes";
import * as auth from "./domains/auth/routes";
import * as testapi from "./domains/testapi/routes";
import { Datasource as NotifDatasource } from "./domains/notifications/datasource";
import { Service as NotifService } from "./domains/notifications/service";
import { Controller as NotifController } from "./domains/notifications/controller";
import * as notifications from "./domains/notifications/routes";
import { Datasource as AuthDatasource } from "./domains/auth/datasource";
import { Service as AuthService } from "./domains/auth/service";

const API_BASE_PATH = "/api/__SLUG__";

function initSuperTokens(): void {
  const connectionURI = process.env.SUPERTOKENS_CONNECTION_URI || "http://localhost:3567";
  const apiKey = process.env.SUPERTOKENS_API_KEY;
  const apiDomain = process.env.API_DOMAIN || "http://localhost";
  const websiteDomain = process.env.WEBSITE_DOMAIN || "http://localhost";

  supertokens.init({
    framework: "express",
    supertokens: { connectionURI, apiKey },
    appInfo: {
      appName: "node-backend",
      apiDomain,
      websiteDomain,
      apiBasePath: `${API_BASE_PATH}/auth/v0`,
      websiteBasePath: "/auth",
    },
    recipeList: [EmailPassword.init(), Session.init(), UserRoles.init(), Dashboard.init()],
  });
}

function initFirebase(): admin.app.App {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const credsJson = process.env.FIREBASE_CREDENTIALS_JSON;
  if (credsJson) {
    return admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(credsJson)),
      projectId,
    });
  }
  // Falls back to GOOGLE_APPLICATION_CREDENTIALS or ambient credentials.
  return admin.initializeApp({ projectId });
}

function initDbPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    return new Pool({ connectionString });
  }
  return new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "__SLUG__",
    password: process.env.DB_PASS || "__SLUG___local_pass",
    database: process.env.DB_NAME || "__SLUG___local",
  });
}

function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Expose-Headers", "st-access-token, st-refresh-token, anti-csrf, X-Span-Id");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
}

async function main(): Promise<void> {
  initLogger();
  const log = getRootLogger();

  initSuperTokens();
  const firebaseApp = initFirebase();
  const pool = initDbPool();
  const db = new LoggingDB(pool);

  const app = express();
  app.use(trace);
  app.use(requestLog);
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(supertokensMiddleware());

  const apiRouter = express.Router();
  app.use(API_BASE_PATH, apiRouter);

  apiRouter.use(health.registerRoutes());

  const authDatasource = new AuthDatasource(db);
  const authService = new AuthService(authDatasource);

  const notifDatasource = new NotifDatasource(db);
  const notifService = new NotifService(notifDatasource, firebaseApp.messaging());
  const notifController = new NotifController(notifService, authService);
  apiRouter.use(notifications.registerRoutes(notifController));

  apiRouter.use(testapi.registerRoutes(db));

  apiRouter.use("/auth", auth.registerRoutes(db));

  app.use(supertokensErrorHandler());
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    log.error({ err }, "unhandled error");
    res.status(500).json({ error: "internal server error" });
  });

  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => {
    log.info({ port }, "starting server");
  });
}

main().catch((err) => {
  getRootLogger().fatal({ err }, "failed to start server");
  process.exit(1);
});
