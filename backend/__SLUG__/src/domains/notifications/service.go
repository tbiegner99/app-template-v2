package notifications

import (
	"context"
	"fmt"

	"firebase.google.com/go/v4/messaging"
	"go.uber.org/zap"
	"go_backend/src/logger"
)

// FCMSender is satisfied by *messaging.Client
type FCMSender interface {
	Send(ctx context.Context, msg *messaging.Message) (string, error)
}

type notifDatasource interface {
	UpsertDeviceToken(ctx context.Context, t *DeviceToken) (int, error)
	DeleteDeviceToken(ctx context.Context, userID, token string) error
	DeleteDeviceTokenByValue(ctx context.Context, token string) error
	GetTokensByUserID(ctx context.Context, userID string) ([]DeviceToken, error)
	InsertNotificationLog(ctx context.Context, log *NotificationLog) (int, error)
	UpdateNotificationLogStatus(ctx context.Context, id int, status, fcmMessageID, errMsg string) error
	GetNotificationLogs(ctx context.Context, filter LogQueryFilter) ([]NotificationLog, int, error)
}

type Service struct {
	ds     notifDatasource
	sender FCMSender
}

func NewService(ds notifDatasource, sender FCMSender) *Service {
	return &Service{ds: ds, sender: sender}
}

func (s *Service) RegisterToken(ctx context.Context, userID string, req *RegisterTokenRequest) (int, error) {
	return s.ds.UpsertDeviceToken(ctx, &DeviceToken{
		UserID:          userID,
		Token:           req.Token,
		Platform:        req.Platform,
		PlatformVersion: req.PlatformVersion,
		AppVersion:      req.AppVersion,
		DeviceID:        req.DeviceID,
	})
}

func (s *Service) DeleteToken(ctx context.Context, userID, token string) error {
	return s.ds.DeleteDeviceToken(ctx, userID, token)
}

func (s *Service) Send(ctx context.Context, req *SendNotificationRequest) (*SendNotificationResponse, error) {
	if req.Type == "alert" && (req.Title == "" || req.Body == "") {
		return nil, fmt.Errorf("title and body required for alert type")
	}
	if len(req.UserIDs) == 0 {
		return nil, fmt.Errorf("user_ids must not be empty")
	}

	log := logger.LoggerFromContext(ctx)
	log.Info("send notification request",
		zap.Strings("user_ids", req.UserIDs),
		zap.String("type", req.Type),
		zap.String("title", req.Title),
	)

	var logIDs []int
	queued := 0

	for _, userID := range req.UserIDs {
		tokens, err := s.ds.GetTokensByUserID(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("get tokens for user %s: %w", userID, err)
		}

		log.Info("resolved device tokens",
			zap.String("user_id", userID),
			zap.Int("token_count", len(tokens)),
		)

		for _, t := range tokens {
			log.Info("sending FCM message",
				zap.String("user_id", userID),
				zap.String("platform", t.Platform),
				zap.String("device_id", t.DeviceID),
				zap.String("token_prefix", truncate(t.Token, 16)),
			)

			data := buildDataPayload(req)
			logID, err := s.ds.InsertNotificationLog(ctx, &NotificationLog{
				UserID:           userID,
				DeviceToken:      t.Token,
				NotificationType: req.Type,
				Title:            req.Title,
				Body:             req.Body,
				DataPayload:      toStringMap(data),
			})
			if err != nil {
				return nil, fmt.Errorf("insert log: %w", err)
			}
			logIDs = append(logIDs, logID)
			queued++

			msg := &messaging.Message{
				Token: t.Token,
				Data:  data,
				Android: &messaging.AndroidConfig{
					Priority: "high",
				},
				APNS: &messaging.APNSConfig{
					Headers: map[string]string{
						"apns-push-type": "background",
						"apns-priority":  "5",
					},
					Payload: &messaging.APNSPayload{
						Aps: &messaging.Aps{
							ContentAvailable: true,
						},
					},
				},
			}

			messageID, fcmErr := s.sender.Send(ctx, msg)
			status, errMsg := "sent", ""
			if fcmErr != nil {
				status = "failed"
				errMsg = fcmErr.Error()
				log.Error("FCM send failed",
					zap.String("user_id", userID),
					zap.String("platform", t.Platform),
					zap.String("device_id", t.DeviceID),
					zap.String("type", req.Type),
					zap.Error(fcmErr),
				)
			} else {
				log.Info("FCM send ok",
					zap.String("user_id", userID),
					zap.String("platform", t.Platform),
					zap.String("device_id", t.DeviceID),
					zap.String("type", req.Type),
					zap.String("message_id", messageID),
				)
			}
			_ = s.ds.UpdateNotificationLogStatus(ctx, logID, status, messageID, errMsg)

			if fcmErr != nil && (messaging.IsRegistrationTokenNotRegistered(fcmErr) || messaging.IsInvalidArgument(fcmErr)) {
				log.Info("removing stale token",
					zap.String("user_id", userID),
					zap.String("device_id", t.DeviceID),
				)
				_ = s.ds.DeleteDeviceTokenByValue(ctx, t.Token)
			}
		}
	}

	log.Info("send notification complete", zap.Int("queued", queued))
	return &SendNotificationResponse{Queued: queued, LogIDs: logIDs}, nil
}

func (s *Service) GetLogs(ctx context.Context, requesterUserID string, isAdmin bool, filter LogQueryFilter) (*LogQueryResponse, error) {
	if !isAdmin {
		filter.UserID = requesterUserID
	}
	logs, total, err := s.ds.GetNotificationLogs(ctx, filter)
	if err != nil {
		return nil, err
	}
	return &LogQueryResponse{Total: total, Results: logs}, nil
}

func buildDataPayload(req *SendNotificationRequest) map[string]string {
	data := map[string]string{
		"type": req.Type,
	}
	if req.Type == "alert" {
		data["title"] = req.Title
		data["body"] = req.Body
	}
	for k, v := range req.Data {
		data[k] = v
	}
	return data
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}

func toStringMap(m map[string]string) map[string]interface{} {
	out := make(map[string]interface{}, len(m))
	for k, v := range m {
		out[k] = v
	}
	return out
}
