export interface DeviceToken {
  id: number;
  userId: string;
  token: string;
  platform: string;
  platformVersion: string;
  appVersion: string;
  deviceId: string;
  dateCreated: string;
  lastModified: string;
}

export interface NotificationLog {
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
}

export interface RegisterTokenRequest {
  token: string;
  platform: string;
  platform_version: string;
  app_version: string;
  device_id: string;
}

export interface SendNotificationRequest {
  user_ids: string[];
  type: string;
  title: string;
  body: string;
  data: Record<string, string>;
}

export interface SendNotificationResponse {
  queued: number;
  log_ids: number[];
}

export interface LogQueryFilter {
  userId: string;
  status: string;
  from: string;
  to: string;
  limit: number;
  offset: number;
}

export interface LogQueryResponse {
  total: number;
  results: NotificationLog[];
}
