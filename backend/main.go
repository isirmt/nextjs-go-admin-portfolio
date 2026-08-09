package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"realtime/internal/query"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlog "gorm.io/gorm/logger"
)

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

	adminSecret := os.Getenv("ADMIN_SECRET")
	if adminSecret == "" {
		log.Fatalf("ADMIN_SECRET isn't set.")
	}

	pSrv := &server{
		db:                   gormDb,
		q:                    query.Use(gormDb),
		uploadDir:            uploadDir,
		allowedOrigin:        os.Getenv("ALLOWED_ORIGIN"),
		maxUploadSize:        20 << 20, // 20 MiB
		adminSecret:          adminSecret,
		embeddingBaseURL:     strings.TrimRight(os.Getenv("EMBEDDING_BASE_URL"), "/"),
		searchEmbeddingModel: getEnv("SEARCH_EMBEDDING_MODEL", "intfloat/multilingual-e5-small"),
		httpClient:           &http.Client{Timeout: 60 * time.Second},
		clickLimiter:         createClickLimiter(2*time.Second, 10000, time.Minute),
		wsHub:                createWsHub(),
	}

	router := echo.New()
	router.HideBanner = true
	router.Use(middleware.Logger())
	router.Use(middleware.Recover())
	router.Use(middleware.CORSWithConfig(corsConfig(pSrv.allowedOrigin)))

	router.GET("/healthz", pSrv.handleHealth)
	router.GET("/ws", pSrv.handleWS)
	epImages := router.Group("/images")
	epImages.GET("", pSrv.handleGetImages)
	epImages.POST("", pSrv.requireAdmin(pSrv.handleUploadImage))
	epImages.GET("/:id", pSrv.handleGetImage)
	epImages.GET("/:id/raw", pSrv.handleServeImage)
	epImages.DELETE("/:id", pSrv.requireAdmin(pSrv.handleDeleteImage))
	epTechStacks := router.Group("/tech-stacks")
	epTechStacks.GET("", pSrv.handleGetTechStacks)
	epTechStacks.GET("/:id", pSrv.handleGetTechStack)
	epTechStacks.POST("", pSrv.requireAdmin(pSrv.handleCreateTechStack))
	epWorks := router.Group("/works")
	epWorks.GET("", pSrv.handleGetWorks)
	epWorks.GET("/ranking", pSrv.handleGetRankingWorks)
	epWorks.GET("/search", pSrv.handleSearchWorks)
	epWorks.POST("", pSrv.requireAdmin(pSrv.handleCreateWork))
	epWorks.POST("/:id/clicks", pSrv.handleCreateWorkClick)
	epWorks.PUT("/:id", pSrv.requireAdmin(pSrv.handleUpdateWork))
	epWorks.DELETE("/:id", pSrv.requireAdmin(pSrv.handleDeleteWork))

	addr := getEnv("HOST", "0.0.0.0") + ":" + getEnv("PORT", "4000")
	log.Printf("backend listening on %s", addr)

	if err := router.Start(addr); err != nil {
		log.Fatalf("[server error] %v", err)
	}
}
