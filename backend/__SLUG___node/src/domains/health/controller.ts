import type { Request, Response } from "express";
import { loggerFromContext } from "../../logger/logger";
import type { Service } from "./service";
import { toDTO } from "./mapper";

export class Controller {
  constructor(private readonly service: Service) {}

  getHealth = (_req: Request, res: Response): void => {
    try {
      const health = this.service.getHealth();
      res.status(200).json(toDTO(health));
    } catch (err) {
      loggerFromContext().error({ err }, "health check error");
      res.status(500).send("internal server error");
    }
  };
}
