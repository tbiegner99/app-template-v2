package main

import (
	"context"
	"database/sql"
	"go_backend/src/domains/auth"
	"go_backend/src/domains/health"
	"go_backend/src/domains/notifications"
	"go_backend/src/domains/testapi"
	"go_backend/src/logger"
	appMiddleware "go_backend/src/middleware"
	"net/http"
	"os"

	firebase "firebase.google.com/go/v4"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/supertokens/supertokens-golang/recipe/dashboard"
	"github.com/supertokens/supertokens-golang/recipe/emailpassword"
	"github.com/supertokens/supertokens-golang/recipe/session"
	"github.com/supertokens/supertokens-golang/recipe/userroles"
	"github.com/supertokens/supertokens-golang/supertokens"
	"go.uber.org/zap"
	"google.golang.org/api/option"
)

func main() {
	logger.InitLogger()

	if err := initSuperTokens(); err != nil {
		zap.L().Fatal("failed to initialize SuperTokens", zap.Error(err))
	}

	firebaseApp, err := initFirebase()
	if err != nil {
		zap.L().Fatal("failed to initialize Firebase", zap.Error(err))
	}

	rawDB, err := initDB()
	if err != nil {
		zap.L().Fatal("failed to connect to database", zap.Error(err))
	}
	defer rawDB.Close()

	db := logger.NewLoggingDB(rawDB)

	router := mux.NewRouter()
	router.Use(appMiddleware.Trace)
	router.Use(appMiddleware.RequestLog)
	router.Use(corsMiddleware)
	router.Use(supertokens.Middleware)
	router.NotFoundHandler = corsMiddleware(supertokens.Middleware(http.NotFoundHandler()))

	apiRouter := router.PathPrefix("/api/__SLUG__").Subrouter()

	healthRouter := health.RegisterRoutes()
	apiRouter.PathPrefix("/health").Handler(http.StripPrefix("/api/__SLUG__", healthRouter))

	authDS := auth.NewDatasource(db)
	authSvc := auth.NewService(authDS)

	notifDS := notifications.NewDatasource(db)
	msgClient, err := firebaseApp.Messaging(context.Background())
	if err != nil {
		zap.L().Fatal("failed to initialize Firebase Messaging client", zap.Error(err))
	}
	notifSvc := notifications.NewService(notifDS, msgClient)
	notifCtrl := notifications.NewController(notifSvc, authSvc)
	notifications.RegisterRoutes(apiRouter, notifCtrl)

	testapi.RegisterRoutes(apiRouter, db)

	authRouter := auth.RegisterRoutes(db)
	apiRouter.PathPrefix("/auth").Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = r.URL.Path[len("/api/__SLUG__/auth"):]
		if r.URL.Path == "" {
			r.URL.Path = "/"
		}
		authRouter.ServeHTTP(w, r)
	}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	zap.L().Info("starting server", zap.String("port", port))
	if err := http.ListenAndServe(":"+port, router); err != nil {
		zap.L().Fatal("server failed", zap.Error(err))
	}
}

func initDB() (*sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "5432"
		}
		user := os.Getenv("DB_USER")
		if user == "" {
			user = "__SLUG__"
		}
		pass := os.Getenv("DB_PASS")
		if pass == "" {
			pass = "__SLUG___local_pass"
		}
		name := os.Getenv("DB_NAME")
		if name == "" {
			name = "__SLUG___local"
		}
		dsn = "host=" + host + " port=" + port + " user=" + user + " password=" + pass + " dbname=" + name + " sslmode=disable"
	}
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

func initFirebase() (*firebase.App, error) {
	ctx := context.Background()
	cfg := &firebase.Config{ProjectID: os.Getenv("FIREBASE_PROJECT_ID")}
	if credsJSON := os.Getenv("FIREBASE_CREDENTIALS_JSON"); credsJSON != "" {
		return firebase.NewApp(ctx, cfg, option.WithCredentialsJSON([]byte(credsJSON)))
	}
	if credsFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); credsFile != "" {
		return firebase.NewApp(ctx, cfg, option.WithCredentialsFile(credsFile))
	}
	return firebase.NewApp(ctx, cfg)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Expose-Headers", "st-access-token, st-refresh-token, anti-csrf, X-Span-Id")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func initSuperTokens() error {
	apiBasePath := "/api/__SLUG__/auth/v0"
	websiteBasePath := "/auth"

	connectionURI := os.Getenv("SUPERTOKENS_CONNECTION_URI")
	if connectionURI == "" {
		connectionURI = "http://localhost:3567"
	}
	apiKey := os.Getenv("SUPERTOKENS_API_KEY")
	apiDomain := os.Getenv("API_DOMAIN")
	if apiDomain == "" {
		apiDomain = "http://localhost"
	}
	websiteDomain := os.Getenv("WEBSITE_DOMAIN")
	if websiteDomain == "" {
		websiteDomain = "http://localhost"
	}

	return supertokens.Init(supertokens.TypeInput{
		Supertokens: &supertokens.ConnectionInfo{
			ConnectionURI: connectionURI,
			APIKey:        apiKey,
		},
		AppInfo: supertokens.AppInfo{
			AppName:         "go-backend",
			APIDomain:       apiDomain,
			WebsiteDomain:   websiteDomain,
			APIBasePath:     &apiBasePath,
			WebsiteBasePath: &websiteBasePath,
		},
		RecipeList: []supertokens.Recipe{
			emailpassword.Init(nil),
			session.Init(nil),
			userroles.Init(nil),
			dashboard.Init(nil),
		},
	})
}
