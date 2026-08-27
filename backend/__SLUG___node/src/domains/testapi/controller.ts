import type { Request, Response } from "express";
import type { Service } from "./service";

export class Controller {
  constructor(private readonly service: Service) {}

  /** Deletes a batch of users from SuperTokens and the users table. Gated by X-Test-Api-Key. */
  deleteUsers = async (req: Request, res: Response): Promise<void> => {
    const apiKey = process.env.TEST_API_KEY;
    if (!apiKey || req.header("X-Test-Api-Key") !== apiKey) {
      res.status(403).json({ error: "forbidden" });
      return;
    }

    const ids: unknown = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "invalid request body" });
      return;
    }

    try {
      const deleted = await this.service.deleteUsers(ids as string[]);
      res.status(200).json({ deleted });
    } catch {
      res.status(500).json({ error: "internal server error" });
    }
  };
}
