package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"realtime/internal/query"
	"realtime/internal/query/model"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlog "gorm.io/gorm/logger"
)

type createTechStackRequest struct {
	Name string `json:"name"`
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

func (pSrv *server) handleHealth(c echo.Context) error {
	return c.String(200, "ok")
}

func (pSrv *server) handleGetTechStacks(c echo.Context) error {
	ctx := c.Request().Context()
	stacks, err := pSrv.q.CommonTechStack.WithContext(ctx).Order(pSrv.q.CommonTechStack.Name).Find()
	if err != nil {
		return c.String(500, "failed to fetch tech stacks")
	}

	return c.JSON(200, stacks)
}

func (pSrv *server) handleGetTechStack(c echo.Context) error {
	stackID := c.Param("id")
	if stackID == "" {
		return c.String(400, "tech stack id is required")
	}

	ctx := c.Request().Context()
	stack, err := pSrv.q.CommonTechStack.WithContext(ctx).Where(pSrv.q.CommonTechStack.ID.Eq(stackID)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "tech stack not found")
		}
		return c.String(500, "failed to fetch tech stack")
	}

	return c.JSON(200, stack)
}

func (pSrv *server) handleCreateTechStack(c echo.Context) error {
	var req createTechStackRequest
	if err := c.Bind(&req); err != nil {
		return c.String(400, "invalid request body")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return c.String(400, "name is required")
	}

	ctx := c.Request().Context()

	newStack := &model.CommonTechStack{
		Name: name,
	}

	if err := pSrv.q.CommonTechStack.WithContext(ctx).Create(newStack); err != nil {
		return c.String(500, "failed to create tech stack")
	}

	return c.JSON(http.StatusCreated, newStack)
}
