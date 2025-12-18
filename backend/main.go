package main

import (
	"context"
	"log"
	"os"
	"realtime/internal/query"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlog "gorm.io/gorm/logger"
)

type server struct {
	db            *gorm.DB
	q             *query.Query
	uploadDir     string
	allowedOrigin string
	maxUploadSize uint32
}

func main() {
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatalf("dbUrl isn't set.")
	}

	gormDb, err := gorm.Open(postgres.Open(dbUrl), &gorm.Config{
		Logger: gormlog.New(
			log.New(os.Stdout, "[gorm] ", log.LstdFlags),
			gormlog.Config{LogLevel: gormlog.Warn, IgnoreRecordNotFoundError: true},
		),
		PrepareStmt: true,
	})
	if err != nil {
		log.Fatalf("failed to init gorm db. %v", err)
	}

	sqlDb, err := gormDb.DB()
	if err != nil {
		log.Fatalf("failed to get db. %v", err)
	}

	// 検証
	ctx := context.Background()
	if err := sqlDb.PingContext(ctx); err != nil {
		log.Fatalf("failed to connect to db. %v", err)
	}

	uploadDir := getEnv("UPLOAD_DIR", "./uploads")
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		log.Fatalf("failed to create file dir. %v", err)
	}

	pSrv := &server{
		db:            gormDb,
		q:             query.Use(gormDb),
		uploadDir:     uploadDir,
		allowedOrigin: os.Getenv("ALLOWED_ORIGIN"),
		maxUploadSize: 20 << 20, // 20 MiB
	}

	router := echo.New()
	router.HideBanner = true
	router.Use(middleware.Logger())
	router.Use(middleware.Recover())
	router.Use(middleware.CORSWithConfig(corsConfig(pSrv.allowedOrigin)))

	router.GET("/healthz", pSrv.handleHealth)
	epImages := router.Group("/images")
	epImages.GET("", pSrv.handleGetImages)
	epImages.POST("", pSrv.handleUploadImage)
	epImages.GET("/:id", pSrv.handleServeImage)
	epImages.DELETE("/:id", pSrv.handleDeleteImage)
	epImages.PUT("/:id", pSrv.handleUpdateImage)

	addr := getEnv("HOST", "0.0.0.0") + ":" + getEnv("PORT", "4000")
	log.Printf("backend listening on %s", addr)

	if err := router.Start(addr); err != nil {
		log.Fatalf("[server error] %v", err)
	}
}

func (pSrv *server) handleHealth(c echo.Context) error {
	return c.String(200, "ok")
}

func (pSrv *server) handleGetImages(c echo.Context) error {
	images, err := pSrv.q.CommonImage.WithContext(c.Request().Context()).Find()
	if err != nil {
		return c.String(500, "internal server error")
	}
	return c.JSON(200, images)
}

func (pSrv *server) handleUploadImage(c echo.Context) error {
	return c.String(200, "ok")
}

func (pSrv *server) handleServeImage(c echo.Context) error {
	return c.String(200, "ok")
}

func (pSrv *server) handleDeleteImage(c echo.Context) error {
	return c.String(200, "ok")
}

func (pSrv *server) handleUpdateImage(c echo.Context) error {
	return c.String(200, "ok")
}

func getEnv(key string, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func corsConfig(allowedOrigin string) middleware.CORSConfig {
	cfg := middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}

	if allowedOrigin != "" {
		cfg.AllowOrigins = []string{allowedOrigin}
	}

	return cfg
}
