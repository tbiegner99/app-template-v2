import type { NextFunction, Request, Response } from "express";
import { loggerFromContext } from "../logger/logger";

/** Logs method, path, status, and duration for every request. */
export function requestLog(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    loggerFromContext().debug(
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration_ms: Date.now() - start,
      },
      "request complete",
    );
  });
  next();
}
