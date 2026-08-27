package notifications

type DeviceToken struct {
	ID              int
	UserID          string
	Token           string
	Platform        string
	PlatformVersion string
	AppVersion      string
	DeviceID        string
	DateCreated     string
	LastModified    string
}

type NotificationLog struct {
	ID               int
	UserID           string
	DeviceToken      string
	NotificationType string
	Title            string
	Body             string
	DataPayload      map[string]interface{}
	Status           string
	FCMMessageID     string
	ErrorMessage     string
	DateCreated      string
	SentAt           string
}

type RegisterTokenRequest struct {
	Token           string `json:"token"`
	Platform        string `json:"platform"`
	PlatformVersion string `json:"platform_version"`
	AppVersion      string `json:"app_version"`
	DeviceID        string `json:"device_id"`
}

type SendNotificationRequest struct {
	UserIDs []string               `json:"user_ids"`
	Type    string                 `json:"type"`
	Title   string                 `json:"title"`
	Body    string                 `json:"body"`
	Data    map[string]string      `json:"data"`
}

type SendNotificationResponse struct {
	Queued int   `json:"queued"`
	LogIDs []int `json:"log_ids"`
}

type LogQueryFilter struct {
	UserID string
	Status string
	From   string
	To     string
	Limit  int
	Offset int
}

type LogQueryResponse struct {
	Total   int               `json:"total"`
	Results []NotificationLog `json:"results"`
}
