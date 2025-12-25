package main

import (
	"context"
	"errors"
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
	adminSecret   string
}

type createWorkURL struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type createTechStackRequest struct {
	Name string `json:"name"`
}

type createWorkRequest struct {
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

type workImageResponse struct {
	ID           string `json:"id"`
	ImageID      string `json:"image_id"`
	DisplayOrder int    `json:"display_order"`
}

type workURLResponse struct {
	ID           string `json:"id"`
	URL          string `json:"url"`
	Label        string `json:"label"`
	DisplayOrder int    `json:"display_order"`
}

type workTechStackResponse struct {
	ID          string `json:"id"`
	TechStackID string `json:"tech_stack_id"`
}

type workResponse struct {
	ID               string                  `json:"id"`
	Title            string                  `json:"title"`
	Comment          string                  `json:"comment"`
	CreatedAt        string                  `json:"created_at"`
	AccentColor      string                  `json:"accent_color"`
	Description      *string                 `json:"description"`
	ThumbnailImageID *string                 `json:"thumbnail_image_id"`
	Images           []workImageResponse     `json:"images"`
	Urls             []workURLResponse       `json:"urls"`
	TechStacks       []workTechStackResponse `json:"tech_stacks"`
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

	adminSecret := os.Getenv("ADMIN_SECRET")
	if adminSecret == "" {
		log.Fatalf("ADMIN_SECRET isn't set.")
	}

	pSrv := &server{
		db:            gormDb,
		q:             query.Use(gormDb),
		uploadDir:     uploadDir,
		allowedOrigin: os.Getenv("ALLOWED_ORIGIN"),
		maxUploadSize: 20 << 20, // 20 MiB
		adminSecret:   adminSecret,
	}

	router := echo.New()
	router.HideBanner = true
	router.Use(middleware.Logger())
	router.Use(middleware.Recover())
	router.Use(middleware.CORSWithConfig(corsConfig(pSrv.allowedOrigin)))

	router.GET("/healthz", pSrv.handleHealth)
	epImages := router.Group("/images")
	epImages.GET("", pSrv.handleGetImages)
	epImages.POST("", pSrv.requireAdmin(pSrv.handleUploadImage))
	epImages.GET("/:id", pSrv.handleGetImage)
	epImages.GET("/:id/raw", pSrv.handleServeImage)
	epImages.DELETE("/:id", pSrv.requireAdmin(pSrv.handleDeleteImage))
	epImages.PUT("/:id", pSrv.requireAdmin(pSrv.handleUpdateImage))
	epTechStacks := router.Group("/tech-stacks")
	epTechStacks.GET("", pSrv.handleGetTechStacks)
	epTechStacks.GET("/:id", pSrv.handleGetTechStack)
	epTechStacks.POST("", pSrv.requireAdmin(pSrv.handleCreateTechStack))
	epWorks := router.Group("/works")
	epWorks.GET("", pSrv.handleGetWorks)
	epWorks.POST("", pSrv.requireAdmin(pSrv.handleCreateWork))

	addr := getEnv("HOST", "0.0.0.0") + ":" + getEnv("PORT", "4000")
	log.Printf("backend listening on %s", addr)

	if err := router.Start(addr); err != nil {
		log.Fatalf("[server error] %v", err)
	}
}

func (pSrv *server) handleHealth(c echo.Context) error {
	return c.String(200, "ok")
}

func (pSrv *server) requireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		secret := c.Request().Header.Get("X-Admin-Secret")
		if secret == "" || secret != pSrv.adminSecret {
			return c.String(http.StatusForbidden, "admin authentication failed")
		}
		return next(c)
	}
}

func (pSrv *server) handleGetImages(c echo.Context) error {
	images, err := pSrv.q.CommonImage.WithContext(c.Request().Context()).Find()
	if err != nil {
		return c.String(500, "internal server error")
	}
	return c.JSON(200, images)
}

func (pSrv *server) handleGetImage(c echo.Context) error {
	imageID := c.Param("id")
	if imageID == "" {
		return c.String(400, "image id is required")
	}

	ctx := c.Request().Context()
	image, err := pSrv.fetchImageByID(ctx, imageID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "image not found")
		}
		return c.String(500, "failed to fetch image")
	}

	return c.JSON(200, image)
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

	ctx := c.Request().Context()
	image, err := pSrv.fetchImageByID(ctx, imageID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "image not found")
		}
		return c.String(500, "failed to fetch image")
	}

	return pSrv.serveImageContent(c, image)
}

func (pSrv *server) fetchImageByID(ctx context.Context, imageID string) (*model.CommonImage, error) {
	return pSrv.q.CommonImage.WithContext(ctx).Where(pSrv.q.CommonImage.ID.Eq(imageID)).First()
}

func (pSrv *server) serveImageContent(c echo.Context, image *model.CommonImage) error {
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

func (pSrv *server) handleGetWorks(c echo.Context) error {
	ctx := c.Request().Context()

	works, err := pSrv.q.IsirmtWork.WithContext(ctx).Order(pSrv.q.IsirmtWork.CreatedAt.Desc()).Find()
	if err != nil {
		return c.String(500, "failed to fetch works")
	}

	if len(works) == 0 {
		return c.JSON(http.StatusOK, []workResponse{})
	}

	workIDs := make([]string, 0, len(works))
	for _, work := range works {
		workIDs = append(workIDs, *work.ID)
	}

	imagesMap := make(map[string][]workImageResponse, len(workIDs))
	urlsMap := make(map[string][]workURLResponse, len(workIDs))
	techMap := make(map[string][]workTechStackResponse, len(workIDs))

	workImages, err := pSrv.q.IsirmtWorkImage.WithContext(ctx).Where(pSrv.q.IsirmtWorkImage.WorkID.In(workIDs...)).Order(pSrv.q.IsirmtWorkImage.WorkID, pSrv.q.IsirmtWorkImage.DisplayOrder).Find()
	if err != nil {
		return c.String(500, "failed to fetch work images")
	}
	for _, img := range workImages {
		imagesMap[img.WorkID] = append(imagesMap[img.WorkID], workImageResponse{
			ID:           *img.ID,
			ImageID:      img.ImageID,
			DisplayOrder: int(img.DisplayOrder),
		})
	}

	workUrls, err := pSrv.q.IsirmtWorkURL.WithContext(ctx).Where(pSrv.q.IsirmtWorkURL.WorkID.In(workIDs...)).Order(pSrv.q.IsirmtWorkURL.WorkID, pSrv.q.IsirmtWorkURL.DisplayOrder).Find()
	if err != nil {
		return c.String(500, "failed to fetch work urls")
	}
	for _, url := range workUrls {
		urlsMap[url.WorkID] = append(urlsMap[url.WorkID], workURLResponse{
			ID:           *url.ID,
			URL:          url.URL,
			Label:        url.Label,
			DisplayOrder: int(url.DisplayOrder),
		})
	}

	workTechs, err := pSrv.q.IsirmtWorkTechStack.WithContext(ctx).Where(pSrv.q.IsirmtWorkTechStack.WorkID.In(workIDs...)).Order(pSrv.q.IsirmtWorkTechStack.WorkID, pSrv.q.IsirmtWorkTechStack.ID).Find()
	if err != nil {
		return c.String(500, "failed to fetch work tech stacks")
	}
	for _, tech := range workTechs {
		techMap[tech.WorkID] = append(techMap[tech.WorkID], workTechStackResponse{
			ID:          *tech.ID,
			TechStackID: tech.TechStackID,
		})
	}

	responses := make([]workResponse, 0, len(works))
	for _, work := range works {
		createdAt := ""
		if work.CreatedAt != nil {
			createdAt = work.CreatedAt.UTC().Format(time.RFC3339Nano)
		}

		workID := *work.ID
		images := imagesMap[workID]
		if images == nil {
			images = []workImageResponse{}
		}
		urls := urlsMap[workID]
		if urls == nil {
			urls = []workURLResponse{}
		}
		techs := techMap[workID]
		if techs == nil {
			techs = []workTechStackResponse{}
		}

		responses = append(responses, workResponse{
			ID:               workID,
			Title:            work.Title,
			Comment:          work.Comment,
			CreatedAt:        createdAt,
			AccentColor:      *work.AccentColor,
			Description:      work.Description,
			ThumbnailImageID: work.ThumbnailImageID,
			Images:           images,
			Urls:             urls,
			TechStacks:       techs,
		})
	}

	return c.JSON(http.StatusOK, responses)
}

func (pSrv *server) handleCreateWork(c echo.Context) error {
	var req createWorkRequest
	if err := c.Bind(&req); err != nil {
		return c.String(400, "invalid request body")
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
		Title:            title,
		Comment:          comment,
		AccentColor:      &accentCopy,
		Description:      descriptionPtr,
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
