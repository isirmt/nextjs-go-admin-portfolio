package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"realtime/internal/query"
	"realtime/internal/query/model"
	"strconv"
	"strings"

	"github.com/google/uuid"
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
	epTechStacks := router.Group("/tech-stacks")
	epTechStacks.GET("", pSrv.handleGetTechStacks)
	epTechStacks.POST("", pSrv.handleCreateTechStack)

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
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.String(400, "file is required")
	}

	src, err := fileHeader.Open()
	if err != nil {
		return c.String(500, "failed to open file")
	}
	defer src.Close()

	imageId, err := uuid.NewRandom()
	if err != nil {
		return c.String(500, "failed to generate image id")
	}

	idStr := imageId.String()

	storageName := idStr + filepath.Ext(fileHeader.Filename)
	dstPath := filepath.Join(pSrv.uploadDir, storageName)
	dst, err := os.Create(dstPath)
	if err != nil {
		return c.String(500, "failed to create file")
	}
	defer dst.Close()

	size, err := io.Copy(dst, src)
	if err != nil {
		return c.String(500, "failed to save file")
	}

	if _, err := dst.Seek(0, io.SeekStart); err != nil {
		return c.String(500, "failed to read saved file")
	}

	_ = dst.Sync()

	newImage := &model.CommonImage{
		ID:       &idStr,
		FileName: fileHeader.Filename,
		FilePath: storageName,
		MimeType: fileHeader.Header.Get("Content-Type"),
		FileSize: size,
	}
	if err := pSrv.q.CommonImage.WithContext(c.Request().Context()).Create(newImage); err != nil {
		return c.String(500, "failed to save image info")
	}

	return c.JSON(200, newImage)
}

func (pSrv *server) handleServeImage(c echo.Context) error {
	imageID := c.Param("id")
	if imageID == "" {
		return c.String(400, "image id is required")
	}
	fmt.Println("Serving image ID:", imageID)

	ctx := c.Request().Context()
	image, err := pSrv.q.CommonImage.WithContext(ctx).Where(pSrv.q.CommonImage.ID.Eq(imageID)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "image not found")
		}
		return c.String(500, "failed to fetch image")
	}

	filePath := filepath.Join(pSrv.uploadDir, image.FilePath)
	file, err := os.Open(filePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return c.String(404, "image file missing")
		}
		return c.String(500, "failed to open image")
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return c.String(500, "failed to read image info")
	}

	c.Response().Header().Set(echo.HeaderContentType, image.MimeType)
	c.Response().Header().Set(echo.HeaderContentLength, strconv.FormatInt(image.FileSize, 10))

	http.ServeContent(c.Response(), c.Request(), image.FileName, fileInfo.ModTime(), file)
	return nil
}

func (pSrv *server) handleDeleteImage(c echo.Context) error {
	return c.String(200, "ok")
}

func (pSrv *server) handleUpdateImage(c echo.Context) error {
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

func (pSrv *server) handleCreateTechStack(c echo.Context) error {
	req := c.Request()
	if err := req.ParseMultipartForm(int64(pSrv.maxUploadSize)); err != nil {
		return c.String(400, "invalid form data")
	}

	name := strings.TrimSpace(c.FormValue("name"))
	if name == "" {
		return c.String(400, "name is required")
	}

	var logoImageID *string
	logoVal := strings.TrimSpace(c.FormValue("logo_image_id"))
	if logoVal != "" {
		logoImageID = &logoVal
	}

	ctx := c.Request().Context()
	if logoImageID != nil {
		_, err := pSrv.q.CommonImage.WithContext(ctx).
			Where(pSrv.q.CommonImage.ID.Eq(*logoImageID)).
			First()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return c.String(400, "logo image not found")
			}
			return c.String(500, "failed to validate logo image")
		}
	}

	newStack := &model.CommonTechStack{
		Name:        name,
		LogoImageID: logoImageID,
	}

	if err := pSrv.q.CommonTechStack.WithContext(ctx).Create(newStack); err != nil {
		return c.String(500, "failed to create tech stack")
	}

	return c.JSON(http.StatusCreated, newStack)
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
