import express, { type NextFunction, type Request, type Response } from "express";
import { Pool } from "pg";

import { initLogger, getRootLogger } from "./logger/logger";
import { LoggingDB } from "./logger/db";
import { trace } from "./middleware/trace";
import { requestLog } from "./middleware/requestLog";

import * as health from "./domains/health/routes";

const API_BASE_PATH = "/api/__SLUG__";

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
  res.header("Access-Control-Expose-Headers", "X-Span-Id");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
}

async function main(): Promise<void> {
  initLogger();
  const log = getRootLogger();

  const pool = initDbPool();
  void new LoggingDB(pool);

  const app = express();
  app.use(trace);
  app.use(requestLog);
  app.use(corsMiddleware);
  app.use(express.json());

  const apiRouter = express.Router();
  app.use(API_BASE_PATH, apiRouter);
  apiRouter.use(health.registerRoutes());

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
