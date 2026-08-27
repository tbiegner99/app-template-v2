import type { Response } from "express";
import type { SessionRequest } from "supertokens-node/framework/express";
import { loggerFromContext } from "../../logger/logger";
import type { Service as AuthService } from "../auth/service";
import type { LogQueryFilter, RegisterTokenRequest, SendNotificationRequest } from "./models";
import type { Service } from "./service";

function logToResponse(l: {
  id: number;
  userId: string;
  deviceToken: string;
  notificationType: string;
  title: string;
  body: string;
  dataPayload: Record<string, unknown>;
  status: string;
  fcmMessageId: string;
  errorMessage: string;
  dateCreated: string;
  sentAt: string;
}) {
  return {
    id: l.id,
    user_id: l.userId,
    device_token: l.deviceToken,
    notification_type: l.notificationType,
    title: l.title || null,
    body: l.body || null,
    data_payload: l.dataPayload,
    status: l.status,
    fcm_message_id: l.fcmMessageId || null,
    error_message: l.errorMessage || null,
    date_created: l.dateCreated,
    sent_at: l.sentAt || null,
  };
}

export class Controller {
  constructor(
    private readonly svc: Service,
    private readonly authSvc: Pick<AuthService, "resolveApplicationUser">,
  ) {}

  /** Extracts the SuperTokens user ID from the session, then resolves it to the app user ID. */
  private async resolveUserId(req: SessionRequest, res: Response): Promise<string | undefined> {
    if (!req.session) {
      res.status(401).send("unauthorized");
      return undefined;
    }
    try {
      const appUser = await this.authSvc.resolveApplicationUser(req.session.getUserId());
      return appUser.id;
    } catch (err) {
      loggerFromContext().error({ err, supertokens_id: req.session.getUserId() }, "resolve user error");
      res.status(500).send("internal server error");
      return undefined;
    }
  }

  registerToken = async (req: SessionRequest, res: Response): Promise<void> => {
    const userId = await this.resolveUserId(req, res);
    if (!userId) return;

    const body = req.body as RegisterTokenRequest;
    if (!body?.token || !body?.platform || !body?.platform_version || !body?.app_version || !body?.device_id) {
      res.status(400).send("token, platform, platform_version, app_version, and device_id are required");
      return;
    }
    if (body.platform !== "ios" && body.platform !== "android") {
      res.status(400).send("invalid platform");
      return;
    }

    try {
      const id = await this.svc.registerToken(userId, body);
      res.status(200).json({ id });
    } catch (err) {
      res.status(500).send((err as Error).message);
    }
  };

  deleteToken = async (req: SessionRequest, res: Response): Promise<void> => {
    const userId = await this.resolveUserId(req, res);
    if (!userId) return;
    const token = req.params.token;

    try {
      await this.svc.deleteToken(userId, token);
      res.status(204).send();
    } catch (err) {
      res.status(500).send((err as Error).message);
    }
  };

  send = async (req: SessionRequest, res: Response): Promise<void> => {
    const body = req.body as SendNotificationRequest;
    if (!body?.user_ids || body.user_ids.length === 0) {
      res.status(400).send("user_ids must not be empty");
      return;
    }
    if (body.type !== "alert" && body.type !== "data") {
      res.status(400).send("type must be alert or data");
      return;
    }
    if (body.type === "alert" && (!body.title || !body.body)) {
      res.status(400).send("title and body required for alert type");
      return;
    }

    try {
      const resp = await this.svc.send(body);
      res.status(202).json(resp);
    } catch (err) {
      res.status(500).send((err as Error).message);
    }
  };

  getLogs = async (req: SessionRequest, res: Response): Promise<void> => {
    const userId = await this.resolveUserId(req, res);
    if (!userId) return;
    // TODO: derive isAdmin from session roles once role support is wired
    const isAdmin = false;

    const q = req.query;
    const filter: LogQueryFilter = {
      userId: (q.user_id as string) ?? "",
      status: (q.status as string) ?? "",
      from: (q.from as string) ?? "",
      to: (q.to as string) ?? "",
      limit: Number(q.limit) || 0,
      offset: Number(q.offset) || 0,
    };

    try {
      const resp = await this.svc.getLogs(userId, isAdmin, filter);
      res.status(200).json({
        total: resp.total,
        results: resp.results.map(logToResponse),
      });
    } catch (err) {
      res.status(500).send((err as Error).message);
    }
  };
}
