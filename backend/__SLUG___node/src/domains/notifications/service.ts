import type { Messaging, Message } from "firebase-admin/messaging";
import { loggerFromContext } from "../../logger/logger";
import type { Datasource } from "./datasource";
import type {
  LogQueryFilter,
  LogQueryResponse,
  RegisterTokenRequest,
  SendNotificationRequest,
  SendNotificationResponse,
} from "./models";

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n)}...`;
}

function buildDataPayload(req: SendNotificationRequest): Record<string, string> {
  const data: Record<string, string> = { type: req.type };
  if (req.type === "alert") {
    data.title = req.title;
    data.body = req.body;
  }
  Object.assign(data, req.data ?? {});
  return data;
}

export class Service {
  constructor(
    private readonly ds: Datasource,
    private readonly messaging: Messaging,
  ) {}

  registerToken(userId: string, req: RegisterTokenRequest): Promise<number> {
    return this.ds.upsertDeviceToken({
      userId,
      token: req.token,
      platform: req.platform,
      platformVersion: req.platform_version,
      appVersion: req.app_version,
      deviceId: req.device_id,
    });
  }

  deleteToken(userId: string, token: string): Promise<void> {
    return this.ds.deleteDeviceToken(userId, token);
  }

  async send(req: SendNotificationRequest): Promise<SendNotificationResponse> {
    if (req.type === "alert" && (!req.title || !req.body)) {
      throw new Error("title and body required for alert type");
    }
    if (!req.user_ids || req.user_ids.length === 0) {
      throw new Error("user_ids must not be empty");
    }

    const log = loggerFromContext();
    log.info({ user_ids: req.user_ids, type: req.type, title: req.title }, "send notification request");

    const logIds: number[] = [];
    let queued = 0;

    for (const userId of req.user_ids) {
      const tokens = await this.ds.getTokensByUserId(userId);
      log.info({ user_id: userId, token_count: tokens.length }, "resolved device tokens");

      for (const t of tokens) {
        log.info(
          { user_id: userId, platform: t.platform, device_id: t.deviceId, token_prefix: truncate(t.token, 16) },
          "sending FCM message",
        );

        const data = buildDataPayload(req);
        const logId = await this.ds.insertNotificationLog({
          userId,
          deviceToken: t.token,
          notificationType: req.type,
          title: req.title,
          body: req.body,
          dataPayload: data,
        });
        logIds.push(logId);
        queued++;

        const message: Message = {
          token: t.token,
          data,
          android: { priority: "high" },
          apns: {
            headers: { "apns-push-type": "background", "apns-priority": "5" },
            payload: { aps: { contentAvailable: true } },
          },
        };

        let status = "sent";
        let errMsg = "";
        let messageId = "";
        try {
          messageId = await this.messaging.send(message);
          log.info(
            { user_id: userId, platform: t.platform, device_id: t.deviceId, type: req.type, message_id: messageId },
            "FCM send ok",
          );
        } catch (err) {
          status = "failed";
          errMsg = (err as Error).message;
          log.error(
            { user_id: userId, platform: t.platform, device_id: t.deviceId, type: req.type, err },
            "FCM send failed",
          );
        }
        await this.ds.updateNotificationLogStatus(logId, status, messageId, errMsg);

        // firebase-admin surfaces these as messaging/registration-token-not-registered
        // and messaging/invalid-argument on the thrown FirebaseMessagingError.
        if (
          status === "failed" &&
          (errMsg.includes("registration-token-not-registered") || errMsg.includes("invalid-argument"))
        ) {
          log.info({ user_id: userId, device_id: t.deviceId }, "removing stale token");
          await this.ds.deleteDeviceTokenByValue(t.token);
        }
      }
    }

    log.info({ queued }, "send notification complete");
    return { queued, log_ids: logIds };
  }

  async getLogs(requesterUserId: string, isAdmin: boolean, filter: LogQueryFilter): Promise<LogQueryResponse> {
    const effectiveFilter = isAdmin ? filter : { ...filter, userId: requesterUserId };
    const { logs, total } = await this.ds.getNotificationLogs(effectiveFilter);
    return { total, results: logs };
  }
}
