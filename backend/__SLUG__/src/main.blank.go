package main

import (
	"database/sql"
	"go_backend/src/domains/health"
	"go_backend/src/logger"
	appMiddleware "go_backend/src/middleware"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

func main() {
	logger.InitLogger()

	rawDB, err := initDB()
	if err != nil {
		zap.L().Fatal("failed to connect to database", zap.Error(err))
	}
	defer rawDB.Close()

	_ = logger.NewLoggingDB(rawDB)

	router := mux.NewRouter()
	router.Use(appMiddleware.Trace)
	router.Use(appMiddleware.RequestLog)
	router.Use(corsMiddleware)

	apiRouter := router.PathPrefix("/api/__SLUG__").Subrouter()

	healthRouter := health.RegisterRoutes()
	apiRouter.PathPrefix("/health").Handler(http.StripPrefix("/api/__SLUG__", healthRouter))

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

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Expose-Headers", "X-Span-Id")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
