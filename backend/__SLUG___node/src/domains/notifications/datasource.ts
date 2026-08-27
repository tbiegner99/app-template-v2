import type { Database } from "../../logger/db";
import type { DeviceToken, LogQueryFilter, NotificationLog } from "./models";

interface TokenRow {
  id: number;
  user_id: string;
  token: string;
  platform: string;
  platform_version: string;
  app_version: string;
  device_id: string;
  date_created: string;
  last_modified: string;
}

interface LogRow {
  id: number;
  user_id: string;
  device_token: string;
  notification_type: string;
  title: string | null;
  body: string | null;
  data_payload: string;
  status: string;
  fcm_message_id: string | null;
  error_message: string | null;
  date_created: string;
  sent_at: string | null;
}

function rowToToken(r: TokenRow): DeviceToken {
  return {
    id: r.id,
    userId: r.user_id,
    token: r.token,
    platform: r.platform,
    platformVersion: r.platform_version,
    appVersion: r.app_version,
    deviceId: r.device_id,
    dateCreated: r.date_created,
    lastModified: r.last_modified,
  };
}

export class Datasource {
  constructor(private readonly db: Database) {}

  async upsertDeviceToken(t: Omit<DeviceToken, "id" | "dateCreated" | "lastModified">): Promise<number> {
    const now = new Date().toISOString();
    const result = await this.db.query<{ id: number }>(
      `INSERT INTO device_tokens (user_id, token, platform, platform_version, app_version, device_id, date_created, last_modified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (token) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         platform_version = EXCLUDED.platform_version,
         app_version = EXCLUDED.app_version,
         device_id = EXCLUDED.device_id,
         last_modified = EXCLUDED.last_modified
       RETURNING id`,
      [t.userId, t.token, t.platform, t.platformVersion, t.appVersion, t.deviceId, now, now],
    );
    return result.rows[0].id;
  }

  async deleteDeviceToken(userId: string, token: string): Promise<void> {
    await this.db.query("DELETE FROM device_tokens WHERE user_id = $1 AND token = $2", [userId, token]);
  }

  async deleteDeviceTokenByValue(token: string): Promise<void> {
    await this.db.query("DELETE FROM device_tokens WHERE token = $1", [token]);
  }

  async getTokensByUserId(userId: string): Promise<DeviceToken[]> {
    const result = await this.db.query<TokenRow>(
      `SELECT id, user_id, token, platform, platform_version, app_version, device_id, date_created, last_modified
       FROM device_tokens WHERE user_id = $1`,
      [userId],
    );
    return result.rows.map(rowToToken);
  }

  async insertNotificationLog(
    log: Pick<NotificationLog, "userId" | "deviceToken" | "notificationType" | "title" | "body" | "dataPayload">,
  ): Promise<number> {
    const now = new Date().toISOString();
    const result = await this.db.query<{ id: number }>(
      `INSERT INTO notification_logs (user_id, device_token, notification_type, title, body, data_payload, status, date_created)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
       RETURNING id`,
      [
        log.userId,
        log.deviceToken,
        log.notificationType,
        log.title,
        log.body,
        JSON.stringify(log.dataPayload),
        now,
      ],
    );
    return result.rows[0].id;
  }

  async updateNotificationLogStatus(
    id: number,
    status: string,
    fcmMessageId: string,
    errMsg: string,
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.db.query(
      `UPDATE notification_logs SET status = $1, fcm_message_id = $2, error_message = $3, sent_at = $4 WHERE id = $5`,
      [status, fcmMessageId, errMsg, now, id],
    );
  }

  async getNotificationLogs(filter: LogQueryFilter): Promise<{ logs: NotificationLog[]; total: number }> {
    const conditions: string[] = [];
    const args: unknown[] = [];
    let argIdx = 1;

    if (filter.userId) {
      conditions.push(`user_id = $${argIdx++}`);
      args.push(filter.userId);
    }
    if (filter.status) {
      conditions.push(`status = $${argIdx++}`);
      args.push(filter.status);
    }
    if (filter.from) {
      conditions.push(`date_created >= $${argIdx++}`);
      args.push(filter.from);
    }
    if (filter.to) {
      conditions.push(`date_created <= $${argIdx++}`);
      args.push(filter.to);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM notification_logs ${where}`,
      args,
    );
    const total = Number(countResult.rows[0].count);

    let limit = filter.limit;
    if (!limit || limit <= 0 || limit > 200) {
      limit = 50;
    }
    const dataArgs = [...args, limit, filter.offset];
    const query = `SELECT id, user_id, device_token, notification_type, title, body, data_payload, status, fcm_message_id, error_message, date_created, sent_at
       FROM notification_logs ${where} ORDER BY date_created DESC LIMIT $${argIdx} OFFSET $${argIdx + 1}`;

    const result = await this.db.query<LogRow>(query, dataArgs);
    const logs = result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      deviceToken: r.device_token,
      notificationType: r.notification_type,
      title: r.title ?? "",
      body: r.body ?? "",
      dataPayload: r.data_payload ? (JSON.parse(r.data_payload) as Record<string, unknown>) : {},
      status: r.status,
      fcmMessageId: r.fcm_message_id ?? "",
      errorMessage: r.error_message ?? "",
      dateCreated: r.date_created,
      sentAt: r.sent_at ?? "",
    }));

    return { logs, total };
  }
}
