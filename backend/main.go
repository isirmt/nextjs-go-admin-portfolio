package main

import (
	"context"
	"encoding/json"
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
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
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
	clickLimiter  *clickLimiter
	wsHub         *wsHub
	wsSeq         uint64
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

type workClickEvent struct {
	Type   string `json:"type"`
	WorkID string `json:"workId"`
	Seq    uint64 `json:"seq"`
}

var hexColorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

type clickLimiter struct {
	mu              sync.Mutex
	lastClicks      map[string]time.Time
	minInterval     time.Duration
	maxEntries      int
	cleanupInterval time.Duration
	lastCleanup     time.Time
}

func createClickLimiter(minInterval time.Duration, maxEntries int, cleanupInterval time.Duration) *clickLimiter {
	return &clickLimiter{
		lastClicks:      make(map[string]time.Time),
		minInterval:     minInterval,
		maxEntries:      maxEntries,
		cleanupInterval: cleanupInterval,
		lastCleanup:     time.Now(),
	}
}

func (l *clickLimiter) isAllowedClick(ip, workID string) bool {
	if l == nil {
		return true
	}

	now := time.Now()
	key := ip + "|" + workID

	l.mu.Lock()
	defer l.mu.Unlock()

	if last, ok := l.lastClicks[key]; ok && now.Sub(last) < l.minInterval {
		return false
	}
	l.lastClicks[key] = now

	if len(l.lastClicks) > l.maxEntries || now.Sub(l.lastCleanup) >= l.cleanupInterval {
		expireBefore := now.Add(-l.minInterval * 10)
		for k, t := range l.lastClicks {
			if t.Before(expireBefore) {
				delete(l.lastClicks, k)
			}
		}
		l.lastCleanup = now
	}

	return true
}

const (
	wsWriteWait  = 2 * time.Second
	wsPongWait   = 60 * time.Second
	wsPingPeriod = 50 * time.Second
	wsBufferSize = 32
)

type wsClient struct {
	conn *websocket.Conn
	send chan []byte
}

type wsHub struct {
	mu      sync.Mutex
	clients map[*wsClient]struct{}
}

func createWsHub() *wsHub {
	return &wsHub{clients: make(map[*wsClient]struct{})}
}

func (h *wsHub) Add(conn *websocket.Conn) *wsClient {
	client := &wsClient{
		conn: conn,
		send: make(chan []byte, wsBufferSize),
	}
	h.mu.Lock()
	h.clients[client] = struct{}{}
	h.mu.Unlock()
	return client
}

func (h *wsHub) Remove(client *wsClient) {
	if client == nil {
		return
	}
	h.mu.Lock()
	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		close(client.send)
	}
	h.mu.Unlock()
}

func (h *wsHub) Broadcast(message []byte) {
	if h == nil {
		return
	}
	h.mu.Lock()
	clients := make([]*wsClient, 0, len(h.clients))
	for client := range h.clients {
		clients = append(clients, client)
	}
	h.mu.Unlock()

	for _, client := range clients {
		select {
		case client.send <- message:
		default:
			h.Remove(client)
			_ = client.conn.Close()
		}
	}
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
		db:            gormDb,
		q:             query.Use(gormDb),
		uploadDir:     uploadDir,
		allowedOrigin: os.Getenv("ALLOWED_ORIGIN"),
		maxUploadSize: 20 << 20, // 20 MiB
		adminSecret:   adminSecret,
		clickLimiter:  createClickLimiter(2*time.Second, 10000, time.Minute),
		wsHub:         createWsHub(),
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

func (pSrv *server) handleWS(c echo.Context) error {
	if pSrv.wsHub == nil {
		return c.NoContent(http.StatusServiceUnavailable)
	}

	upgrader := pSrv.wsUpgrader()
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	client := pSrv.wsHub.Add(conn)

	conn.SetReadLimit(512)
	conn.SetReadDeadline(time.Now().Add(wsPongWait))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(wsPongWait))
		return nil
	})

	go func() {
		ticker := time.NewTicker(wsPingPeriod)
		defer ticker.Stop()
		for {
			select {
			case message, ok := <-client.send:
				if !ok {
					_ = conn.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}
				conn.SetWriteDeadline(time.Now().Add(wsWriteWait))
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					pSrv.wsHub.Remove(client)
					_ = conn.Close()
					return
				}
			case <-ticker.C:
				conn.SetWriteDeadline(time.Now().Add(wsWriteWait))
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					pSrv.wsHub.Remove(client)
					_ = conn.Close()
					return
				}
			}
		}
	}()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}

	pSrv.wsHub.Remove(client)
	return conn.Close()
}

func (pSrv *server) wsUpgrader() websocket.Upgrader {
	allowedOrigin := strings.TrimSpace(pSrv.allowedOrigin)
	return websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			if allowedOrigin == "" || allowedOrigin == "*" {
				return true
			}
			return r.Header.Get("Origin") == allowedOrigin
		},
	}
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
	if fileHeader.Size > 0 && fileHeader.Size > int64(pSrv.maxUploadSize) {
		return c.String(http.StatusRequestEntityTooLarge, "file too large")
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

	limit := int64(pSrv.maxUploadSize) + 1
	size, err := io.Copy(dst, io.LimitReader(src, limit))
	if err != nil {
		return c.String(500, "failed to save file")
	}

	if size > int64(pSrv.maxUploadSize) {
		_ = dst.Close()
		_ = os.Remove(dstPath)
		return c.String(http.StatusRequestEntityTooLarge, "file too large")
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
	c.Response().Header().Set(echo.HeaderCacheControl, "public, max-age=31536000")

	http.ServeContent(c.Response(), c.Request(), image.FileName, fileInfo.ModTime(), file)
	return nil
}

func (pSrv *server) handleDeleteImage(c echo.Context) error {
	imageID := strings.TrimSpace(c.Param("id"))
	if imageID == "" {
		return c.String(400, "image id is required")
	}

	ctx := c.Request().Context()
	if _, err := pSrv.q.CommonImage.WithContext(ctx).Where(pSrv.q.CommonImage.ID.Eq(imageID)).First(); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "image not found")
		}
		return c.String(500, "failed to fetch image")
	}

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if _, err := tx.CommonImage.WithContext(ctx).Where(tx.CommonImage.ID.Eq(imageID)).Delete(); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return c.String(500, "failed to delete image")
	}
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

func (pSrv *server) broadcastWorkClick(workID string) {
	if pSrv.wsHub == nil {
		return
	}
	seq := atomic.AddUint64(&pSrv.wsSeq, 1)
	event := workClickEvent{
		Type:   "work_click",
		WorkID: workID,
		Seq:    seq,
	}
	payload, err := json.Marshal(event)
	if err != nil {
		return
	}
	pSrv.wsHub.Broadcast(payload)
}

func (pSrv *server) handleCreateWorkClick(c echo.Context) error {
	workID := strings.TrimSpace(c.Param("id"))
	if workID == "" {
		return c.String(400, "work id is required")
	}

	ip := c.RealIP()
	if ip == "" {
		ip = "unknown"
	}
	if !pSrv.clickLimiter.isAllowedClick(ip, workID) {
		return c.NoContent(http.StatusAccepted)
	}

	ctx := c.Request().Context()
	click := &model.IsirmtWorkClick{
		WorkID: workID,
	}
	if err := pSrv.q.IsirmtWorkClick.WithContext(ctx).Create(click); err != nil {
		return c.String(500, "failed to create work click")
	}

	pSrv.broadcastWorkClick(workID)
	return c.NoContent(http.StatusCreated)
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

func (pSrv *server) handleUpdateWork(c echo.Context) error {
	workID := strings.TrimSpace(c.Param("id"))
	if workID == "" {
		return c.String(400, "work id is required")
	}

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

	if _, err := pSrv.q.IsirmtWork.WithContext(ctx).Where(pSrv.q.IsirmtWork.ID.Eq(workID)).First(); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "work not found")
		}
		return c.String(500, "failed to fetch work")
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

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if _, err := tx.IsirmtWork.WithContext(ctx).Where(tx.IsirmtWork.ID.Eq(workID)).Updates(map[string]interface{}{
			"title":              title,
			"comment":            comment,
			"accent_color":       accentColor,
			"description":        descriptionPtr,
			"thumbnail_image_id": thumbnailID,
			"created_at":         publishedTime,
		}); err != nil {
			return err
		}

		if _, err := tx.IsirmtWorkImage.WithContext(ctx).Where(tx.IsirmtWorkImage.WorkID.Eq(workID)).Delete(); err != nil {
			return err
		}
		if _, err := tx.IsirmtWorkURL.WithContext(ctx).Where(tx.IsirmtWorkURL.WorkID.Eq(workID)).Delete(); err != nil {
			return err
		}
		if _, err := tx.IsirmtWorkTechStack.WithContext(ctx).Where(tx.IsirmtWorkTechStack.WorkID.Eq(workID)).Delete(); err != nil {
			return err
		}

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
		return c.String(500, "failed to update work")
	}

	return c.String(http.StatusOK, "ok")
}

func (pSrv *server) handleDeleteWork(c echo.Context) error {
	workID := strings.TrimSpace(c.Param("id"))
	if workID == "" {
		return c.String(400, "work id is required")
	}

	ctx := c.Request().Context()
	if _, err := pSrv.q.IsirmtWork.WithContext(ctx).Where(pSrv.q.IsirmtWork.ID.Eq(workID)).First(); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "work not found")
		}
		return c.String(500, "failed to fetch work")
	}

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if _, err := tx.IsirmtWork.WithContext(ctx).Where(tx.IsirmtWork.ID.Eq(workID)).Delete(); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return c.String(500, "failed to delete work")
	}

	return c.String(http.StatusOK, "ok")
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

	if allowedOrigin != "" && allowedOrigin != "*" {
		cfg.AllowOrigins = []string{allowedOrigin}
	}

	return cfg
}
