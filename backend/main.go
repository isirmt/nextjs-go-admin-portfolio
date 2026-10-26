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
	defer sqlDb.Close()

	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "backfill-blog-excerpts":
			updatedCount, err := backfillBlogArticleExcerpts(ctx, gormDb)
			if err != nil {
				log.Fatalf("failed to backfill blog excerpts: %v", err)
			}
			log.Printf("backfilled %d blog article excerpts", updatedCount)
			return
		default:
			log.Fatalf("unknown command: %s", os.Args[1])
		}
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

	epBlogTags := router.Group("/blog-tags")
	epBlogTags.GET("", pSrv.handleGetBlogTags)
	epBlogTags.GET("/:id", pSrv.handleGetBlogTag)
	epBlogTags.POST("", pSrv.requireAdmin(pSrv.handleCreateBlogTag))

	epBlogSeries := router.Group("/blog-series")
	epBlogSeries.GET("", pSrv.handleGetBlogSeries)
	epBlogSeries.POST("", pSrv.requireAdmin(pSrv.handleCreateBlogSeries))
	epBlogSeries.PUT("/:id", pSrv.requireAdmin(pSrv.handleUpdateBlogSeries))
	epBlogSeries.DELETE("/:id", pSrv.requireAdmin(pSrv.handleDeleteBlogSeries))
	epBlogSeries.GET("/:identifier", pSrv.handleGetBlogSeries)

	epBlogs := router.Group("/blogs")
	epBlogs.GET("", pSrv.handleGetBlogArticles)
	epBlogs.POST("", pSrv.requireAdmin(pSrv.handleCreateBlogArticle))
	epBlogs.GET("/previews/:token", pSrv.handleGetBlogPreview)
	epBlogs.GET("/:identifier/related", pSrv.handleGetRelatedBlogArticles)
	epBlogs.GET("/:id/preview-links", pSrv.requireAdmin(pSrv.handleGetBlogPreviewLinks))
	epBlogs.POST("/:id/preview-links", pSrv.requireAdmin(pSrv.handleCreateBlogPreviewLink))
	epBlogs.DELETE("/:id/preview-links/:linkId", pSrv.requireAdmin(pSrv.handleRevokeBlogPreviewLink))
	epBlogs.PUT("/:id", pSrv.requireAdmin(pSrv.handleUpdateBlogArticle))
	epBlogs.DELETE("/:id", pSrv.requireAdmin(pSrv.handleDeleteBlogArticle))
	epBlogs.GET("/:identifier", pSrv.handleGetBlogArticle)

	addr := getEnv("HOST", "0.0.0.0") + ":" + getEnv("PORT", "4000")
	log.Printf("backend listening on %s", addr)

	if err := router.Start(addr); err != nil {
		log.Fatalf("[server error] %v", err)
	}
}
