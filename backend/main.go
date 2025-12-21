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
	"regexp"
	"strconv"
	"strings"
	"time"

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

type createWorkURL struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type createTechStackRequest struct {
	Name        string  `json:"name"`
	LogoImageID *string `json:"logo_image_id"`
}

type createWorkRequest struct {
	Slug             string          `json:"slug"`
	Title            string          `json:"title"`
	Comment          string          `json:"comment"`
	Description      string          `json:"description"`
	AccentColor      string          `json:"accent_color"`
	PublishedDate    string          `json:"published_date"`
	ThumbnailImageID string          `json:"thumbnail_image_id"`
	WorkImageIDs     []string        `json:"work_image_ids"`
	TechStackIDs     []string        `json:"tech_stack_ids"`
	Urls             []createWorkURL `json:"urls"`
}

var hexColorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

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
	epWorks := router.Group("/works")
	epWorks.POST("", pSrv.handleCreateWork)

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
	var req createTechStackRequest
	if err := c.Bind(&req); err != nil {
		return c.String(400, "invalid request body")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return c.String(400, "name is required")
	}

	ctx := c.Request().Context()
	var logoImageID *string
	if req.LogoImageID != nil {
		trimmed := strings.TrimSpace(*req.LogoImageID)
		if trimmed != "" {
			logoImageID = &trimmed
		}
	}
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

func (pSrv *server) handleCreateWork(c echo.Context) error {
	var req createWorkRequest
	if err := c.Bind(&req); err != nil {
		return c.String(400, "invalid request body")
	}

	slug := strings.TrimSpace(req.Slug)
	if slug == "" {
		return c.String(400, "slug is required")
	}

	title := strings.TrimSpace(req.Title)
	if title == "" {
		return c.String(400, "title is required")
	}

	comment := strings.TrimSpace(req.Comment)
	if comment == "" {
		return c.String(400, "comment is required")
	}

	accentColor := strings.TrimSpace(req.AccentColor)
	if accentColor == "" {
		accentColor = "#000000"
	}
	accentColor = strings.ToLower(accentColor)
	if !hexColorPattern.MatchString(accentColor) {
		return c.String(400, "accent_color must be formatted as #rrggbb")
	}

	description := strings.TrimSpace(req.Description)
	var descriptionPtr *string
	if description != "" {
		descriptionPtr = &description
	}

	published := strings.TrimSpace(req.PublishedDate)
	if published == "" {
		return c.String(400, "published_date is required")
	}
	parsedPublished, err := time.Parse("2006-01-02", published)
	if err != nil {
		return c.String(400, "published_date must be formatted as YYYY-MM-DD")
	}
	publishedTime := parsedPublished.UTC()

	thumbnailID := strings.TrimSpace(req.ThumbnailImageID)
	if thumbnailID == "" {
		return c.String(400, "thumbnail_image_id is required")
	}

	ctx := c.Request().Context()

	if _, err := pSrv.q.IsirmtWork.WithContext(ctx).Where(pSrv.q.IsirmtWork.Slug.Eq(slug)).First(); err == nil {
		return c.String(http.StatusConflict, "slug already exists")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(500, "failed to validate slug")
	}

	workImageIDs := make([]string, 0, len(req.WorkImageIDs))
	imageIDSet := map[string]struct{}{}
	for _, id := range req.WorkImageIDs {
		trimmed := strings.TrimSpace(id)
		if trimmed == "" {
			continue
		}
		workImageIDs = append(workImageIDs, trimmed)
		imageIDSet[trimmed] = struct{}{}
	}
	imageIDSet[thumbnailID] = struct{}{}

	if len(imageIDSet) > 0 {
		imageIDs := make([]string, 0, len(imageIDSet))
		for id := range imageIDSet {
			imageIDs = append(imageIDs, id)
		}
		count, err := pSrv.q.CommonImage.WithContext(ctx).Where(pSrv.q.CommonImage.ID.In(imageIDs...)).Count()
		if err != nil {
			return c.String(500, "failed to validate images")
		}
		if int(count) != len(imageIDs) {
			return c.String(400, "unknown image id provided")
		}
	}

	techStackIDs := make([]string, 0, len(req.TechStackIDs))
	techSet := map[string]struct{}{}
	for _, id := range req.TechStackIDs {
		trimmed := strings.TrimSpace(id)
		if trimmed == "" {
			continue
		}
		if _, exists := techSet[trimmed]; exists {
			continue
		}
		techSet[trimmed] = struct{}{}
		techStackIDs = append(techStackIDs, trimmed)
	}
	if len(techStackIDs) == 0 {
		return c.String(400, "tech_stack_ids is required")
	}
	if count, err := pSrv.q.CommonTechStack.WithContext(ctx).Where(pSrv.q.CommonTechStack.ID.In(techStackIDs...)).Count(); err != nil {
		return c.String(500, "failed to validate tech stacks")
	} else if int(count) != len(techStackIDs) {
		return c.String(400, "unknown tech stack id provided")
	}

	filteredUrls := make([]createWorkURL, 0, len(req.Urls))
	for _, entry := range req.Urls {
		label := strings.TrimSpace(entry.Label)
		url := strings.TrimSpace(entry.URL)
		if label == "" && url == "" {
			continue
		}
		if label == "" || url == "" {
			return c.String(400, "url entries require both label and url")
		}
		filteredUrls = append(filteredUrls, createWorkURL{
			Label: label,
			URL:   url,
		})
	}

	thumbnailCopy := thumbnailID
	accentCopy := accentColor

	work := &model.IsirmtWork{
		Slug:             slug,
		Title:            title,
		Comment:          comment,
		AccentColor:      &accentCopy,
		Description:      descriptionPtr,
		IsPublic:         true,
		ThumbnailImageID: &thumbnailCopy,
		CreatedAt:        &publishedTime,
	}

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if err := tx.IsirmtWork.WithContext(ctx).Create(work); err != nil {
			return err
		}
		if work.ID == nil {
			return errors.New("failed to generate work id")
		}
		workID := *work.ID

		if len(workImageIDs) > 0 {
			images := make([]*model.IsirmtWorkImage, 0, len(workImageIDs))
			for idx, imageID := range workImageIDs {
				images = append(images, &model.IsirmtWorkImage{
					WorkID:       workID,
					ImageID:      imageID,
					DisplayOrder: int32(idx),
				})
			}
			if err := tx.IsirmtWorkImage.WithContext(ctx).Create(images...); err != nil {
				return err
			}
		}

		if len(filteredUrls) > 0 {
			urlModels := make([]*model.IsirmtWorkURL, 0, len(filteredUrls))
			for idx, entry := range filteredUrls {
				urlModels = append(urlModels, &model.IsirmtWorkURL{
					WorkID:       workID,
					Label:        entry.Label,
					URL:          entry.URL,
					DisplayOrder: int32(idx),
				})
			}
			if err := tx.IsirmtWorkURL.WithContext(ctx).Create(urlModels...); err != nil {
				return err
			}
		}

		if len(techStackIDs) > 0 {
			techModels := make([]*model.IsirmtWorkTechStack, 0, len(techStackIDs))
			for _, techID := range techStackIDs {
				techModels = append(techModels, &model.IsirmtWorkTechStack{
					WorkID:      workID,
					TechStackID: techID,
				})
			}
			if err := tx.IsirmtWorkTechStack.WithContext(ctx).Create(techModels...); err != nil {
				return err
			}
		}

		return nil
	}); err != nil {
		return c.String(500, "failed to create work")
	}

	return c.JSON(http.StatusCreated, work)
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
