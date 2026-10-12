package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"realtime/internal/query"
	"realtime/internal/query/model"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

const (
	blogArticleStatusDraft     = "draft"
	blogArticleStatusPublished = "published"
)

var (
	blogSlugPattern      = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
	blogMarkdownImageURL = regexp.MustCompile(`(?i)(?:/api)?/images/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/raw`)
)

type blogArticleRequest struct {
	Status           string  `json:"status"`
	Title            string  `json:"title"`
	Slug             string  `json:"slug"`
	BodyMarkdown     string  `json:"body_markdown"`
	ThumbnailImageID *string `json:"thumbnail_image_id"`
	PublishedAt      *string `json:"published_at"`
}

type blogArticleInput struct {
	status           string
	title            string
	slug             string
	bodyMarkdown     string
	thumbnailImageID *string
	publishedAt      *time.Time
	bodyImageIDs     []string
}

type createBlogPreviewLinkRequest struct {
	ExpiresAt *string `json:"expires_at"`
}

type blogPreviewLinkResponse struct {
	ID        string  `json:"id"`
	Token     string  `json:"token,omitempty"`
	ExpiresAt *string `json:"expires_at"`
	RevokedAt *string `json:"revoked_at"`
	CreatedAt string  `json:"created_at"`
}

type blogArticleSummaryResponse struct {
	ID               string  `json:"id"`
	Status           string  `json:"status,omitempty"`
	Title            string  `json:"title"`
	Slug             string  `json:"slug"`
	ThumbnailImageID *string `json:"thumbnail_image_id"`
	CreatedAt        string  `json:"created_at"`
	PublishedAt      *string `json:"published_at"`
	UpdatedAt        string  `json:"updated_at"`
}

type blogArticleResponse struct {
	blogArticleSummaryResponse
	BodyMarkdown string   `json:"body_markdown"`
	BodyImageIDs []string `json:"body_image_ids"`
}

func formatBlogTime(value *time.Time) string {
	if value == nil {
		return ""
	}
	return value.UTC().Format(time.RFC3339Nano)
}

func formatOptionalBlogTime(value *time.Time) *string {
	if value == nil {
		return nil
	}
	formatted := formatBlogTime(value)
	return &formatted
}

func blogArticleSummary(article *model.BlogArticle, includeStatus bool) blogArticleSummaryResponse {
	status := ""
	if includeStatus && article.Status != nil {
		status = *article.Status
	}

	articleID := ""
	if article.ID != nil {
		articleID = *article.ID
	}
	return blogArticleSummaryResponse{
		ID:               articleID,
		Status:           status,
		Title:            article.Title,
		Slug:             article.Slug,
		ThumbnailImageID: article.ThumbnailImageID,
		CreatedAt:        formatBlogTime(article.CreatedAt),
		PublishedAt:      formatOptionalBlogTime(article.PublishedAt),
		UpdatedAt:        formatBlogTime(article.UpdatedAt),
	}
}

func blogArticleDetail(article *model.BlogArticle, includeStatus bool) blogArticleResponse {
	bodyImageIDs := make([]string, 0, len(article.BodyImages))
	for _, image := range article.BodyImages {
		bodyImageIDs = append(bodyImageIDs, image.ImageID)
	}
	return blogArticleResponse{
		blogArticleSummaryResponse: blogArticleSummary(article, includeStatus),
		BodyMarkdown:               article.BodyMarkdown,
		BodyImageIDs:               bodyImageIDs,
	}
}

func (pSrv *server) withBlogArticleRelations(articleQuery query.IBlogArticleDo) query.IBlogArticleDo {
	return articleQuery.Preload(pSrv.q.BlogArticle.BodyImages)
}

func parseBlogArticleInput(req blogArticleRequest) (blogArticleInput, error) {
	status := strings.ToLower(strings.TrimSpace(req.Status))
	if status != blogArticleStatusDraft && status != blogArticleStatusPublished {
		return blogArticleInput{}, errors.New("status must be draft or published")
	}

	title := strings.TrimSpace(req.Title)
	if title == "" {
		return blogArticleInput{}, errors.New("title is required")
	}

	slug := strings.ToLower(strings.TrimSpace(req.Slug))
	if !blogSlugPattern.MatchString(slug) {
		return blogArticleInput{}, errors.New("slug must contain lowercase letters, numbers, and hyphens only")
	}

	bodyMarkdown := strings.TrimSpace(req.BodyMarkdown)
	if bodyMarkdown == "" {
		return blogArticleInput{}, errors.New("body_markdown is required")
	}

	var thumbnailImageID *string
	if req.ThumbnailImageID != nil {
		trimmed := strings.TrimSpace(*req.ThumbnailImageID)
		if trimmed != "" {
			thumbnailImageID = &trimmed
		}
	}

	var publishedAt *time.Time
	if req.PublishedAt != nil && strings.TrimSpace(*req.PublishedAt) != "" {
		parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(*req.PublishedAt))
		if err != nil {
			return blogArticleInput{}, errors.New("published_at must be RFC3339")
		}
		utc := parsed.UTC()
		publishedAt = &utc
	}
	if status == blogArticleStatusPublished && publishedAt == nil {
		now := time.Now().UTC()
		publishedAt = &now
	}

	return blogArticleInput{
		status:           status,
		title:            title,
		slug:             slug,
		bodyMarkdown:     bodyMarkdown,
		thumbnailImageID: thumbnailImageID,
		publishedAt:      publishedAt,
		bodyImageIDs:     extractBlogImageIDs(bodyMarkdown),
	}, nil
}

func extractBlogImageIDs(markdown string) []string {
	matches := blogMarkdownImageURL.FindAllStringSubmatch(markdown, -1)
	seen := make(map[string]struct{}, len(matches))
	ids := make([]string, 0, len(matches))
	for _, match := range matches {
		imageID := strings.ToLower(match[1])
		if _, exists := seen[imageID]; exists {
			continue
		}
		seen[imageID] = struct{}{}
		ids = append(ids, imageID)
	}
	return ids
}

func validateBlogImageIDs(ctx echo.Context, q *query.Query, thumbnailImageID *string, bodyImageIDs []string) error {
	imageSet := make(map[string]struct{}, len(bodyImageIDs)+1)
	if thumbnailImageID != nil {
		imageSet[*thumbnailImageID] = struct{}{}
	}
	for _, imageID := range bodyImageIDs {
		imageSet[imageID] = struct{}{}
	}
	if len(imageSet) == 0 {
		return nil
	}

	imageIDs := make([]string, 0, len(imageSet))
	for imageID := range imageSet {
		imageIDs = append(imageIDs, imageID)
	}
	count, err := q.CommonImage.WithContext(ctx.Request().Context()).
		Where(q.CommonImage.ID.In(imageIDs...)).Count()
	if err != nil {
		return fmt.Errorf("validate images: %w", err)
	}
	if int(count) != len(imageIDs) {
		return echo.NewHTTPError(http.StatusBadRequest, "unknown image id provided")
	}
	return nil
}

func syncBlogArticleImages(ctx echo.Context, tx *query.Query, articleID string, imageIDs []string) error {
	if _, err := tx.BlogArticleImage.WithContext(ctx.Request().Context()).
		Where(tx.BlogArticleImage.ArticleID.Eq(articleID)).Delete(); err != nil {
		return err
	}
	if len(imageIDs) == 0 {
		return nil
	}

	images := make([]*model.BlogArticleImage, 0, len(imageIDs))
	for _, imageID := range imageIDs {
		images = append(images, &model.BlogArticleImage{
			ArticleID: articleID,
			ImageID:   imageID,
		})
	}
	return tx.BlogArticleImage.WithContext(ctx.Request().Context()).Create(images...)
}

func (pSrv *server) ensureBlogSlugAvailable(c echo.Context, slug, ignoredArticleID string) error {
	article, err := pSrv.q.BlogArticle.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogArticle.Slug.Eq(slug)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	if article.ID == nil || *article.ID != ignoredArticleID {
		return echo.NewHTTPError(http.StatusConflict, "slug is already in use")
	}
	return nil
}

func (pSrv *server) handleGetBlogArticles(c echo.Context) error {
	isAdmin := pSrv.isAdminRequest(c)
	articleQuery := pSrv.q.BlogArticle.WithContext(c.Request().Context())
	if isAdmin {
		articleQuery = articleQuery.Order(pSrv.q.BlogArticle.UpdatedAt.Desc())
	} else {
		articleQuery = articleQuery.
			Where(
				pSrv.q.BlogArticle.Status.Eq(blogArticleStatusPublished),
				pSrv.q.BlogArticle.PublishedAt.Lte(time.Now()),
			).
			Order(pSrv.q.BlogArticle.PublishedAt.Desc())
	}
	articles, err := articleQuery.Find()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch blog articles")
	}

	response := make([]blogArticleSummaryResponse, 0, len(articles))
	for _, article := range articles {
		response = append(response, blogArticleSummary(article, isAdmin))
	}
	return c.JSON(http.StatusOK, response)
}

func (pSrv *server) handleGetBlogArticle(c echo.Context) error {
	identifier := strings.TrimSpace(c.Param("identifier"))
	if identifier == "" {
		return c.String(http.StatusBadRequest, "article identifier is required")
	}

	isAdmin := pSrv.isAdminRequest(c)
	articleQuery := pSrv.withBlogArticleRelations(pSrv.q.BlogArticle.WithContext(c.Request().Context()))
	if _, err := uuid.Parse(identifier); err == nil {
		articleQuery = articleQuery.Where(pSrv.q.BlogArticle.ID.Eq(identifier))
	} else {
		articleQuery = articleQuery.Where(pSrv.q.BlogArticle.Slug.Eq(strings.ToLower(identifier)))
	}
	if !isAdmin {
		articleQuery = articleQuery.Where(
			pSrv.q.BlogArticle.Status.Eq(blogArticleStatusPublished),
			pSrv.q.BlogArticle.PublishedAt.Lte(time.Now()),
		)
	}
	article, err := articleQuery.First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(http.StatusNotFound, "blog article not found")
		}
		return c.String(http.StatusInternalServerError, "failed to fetch blog article")
	}
	return c.JSON(http.StatusOK, blogArticleDetail(article, isAdmin))
}

func (pSrv *server) handleCreateBlogArticle(c echo.Context) error {
	var req blogArticleRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid request body")
	}
	input, err := parseBlogArticleInput(req)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	if err := pSrv.ensureBlogSlugAvailable(c, input.slug, ""); err != nil {
		return err
	}
	if err := validateBlogImageIDs(c, pSrv.q, input.thumbnailImageID, input.bodyImageIDs); err != nil {
		return err
	}

	status := input.status
	article := &model.BlogArticle{
		Status:           &status,
		Title:            input.title,
		Slug:             input.slug,
		BodyMarkdown:     input.bodyMarkdown,
		ThumbnailImageID: input.thumbnailImageID,
		PublishedAt:      input.publishedAt,
	}
	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if err := tx.BlogArticle.WithContext(c.Request().Context()).Create(article); err != nil {
			return err
		}
		if article.ID == nil {
			return errors.New("failed to generate blog article id")
		}
		return syncBlogArticleImages(c, tx, *article.ID, input.bodyImageIDs)
	}); err != nil {
		return c.String(http.StatusInternalServerError, "failed to create blog article")
	}

	createdArticle, err := pSrv.withBlogArticleRelations(pSrv.q.BlogArticle.WithContext(c.Request().Context())).
		Where(pSrv.q.BlogArticle.ID.Eq(*article.ID)).First()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch created blog article")
	}
	return c.JSON(http.StatusCreated, blogArticleDetail(createdArticle, true))
}

func (pSrv *server) handleUpdateBlogArticle(c echo.Context) error {
	articleID := strings.TrimSpace(c.Param("id"))
	if articleID == "" {
		return c.String(http.StatusBadRequest, "article id is required")
	}

	var req blogArticleRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid request body")
	}
	input, err := parseBlogArticleInput(req)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	if _, err := pSrv.q.BlogArticle.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogArticle.ID.Eq(articleID)).First(); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(http.StatusNotFound, "blog article not found")
		}
		return c.String(http.StatusInternalServerError, "failed to fetch blog article")
	}
	if err := pSrv.ensureBlogSlugAvailable(c, input.slug, articleID); err != nil {
		return err
	}
	if err := validateBlogImageIDs(c, pSrv.q, input.thumbnailImageID, input.bodyImageIDs); err != nil {
		return err
	}

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if _, err := tx.BlogArticle.WithContext(c.Request().Context()).
			Where(tx.BlogArticle.ID.Eq(articleID)).Updates(map[string]interface{}{
			"status":             input.status,
			"title":              input.title,
			"slug":               input.slug,
			"body_markdown":      input.bodyMarkdown,
			"thumbnail_image_id": input.thumbnailImageID,
			"published_at":       input.publishedAt,
		}); err != nil {
			return err
		}
		return syncBlogArticleImages(c, tx, articleID, input.bodyImageIDs)
	}); err != nil {
		return c.String(http.StatusInternalServerError, "failed to update blog article")
	}

	updatedArticle, err := pSrv.withBlogArticleRelations(pSrv.q.BlogArticle.WithContext(c.Request().Context())).
		Where(pSrv.q.BlogArticle.ID.Eq(articleID)).First()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch updated blog article")
	}
	return c.JSON(http.StatusOK, blogArticleDetail(updatedArticle, true))
}

func (pSrv *server) handleDeleteBlogArticle(c echo.Context) error {
	articleID := strings.TrimSpace(c.Param("id"))
	if articleID == "" {
		return c.String(http.StatusBadRequest, "article id is required")
	}
	result, err := pSrv.q.BlogArticle.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogArticle.ID.Eq(articleID)).Delete()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to delete blog article")
	}
	if result.RowsAffected == 0 {
		return c.String(http.StatusNotFound, "blog article not found")
	}
	return c.NoContent(http.StatusNoContent)
}

func hashPreviewToken(token string) string {
	digest := sha256.Sum256([]byte(token))
	return hex.EncodeToString(digest[:])
}

func newPreviewToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(bytes), nil
}

func parsePreviewLinkExpiry(raw *string) (*time.Time, error) {
	if raw == nil || strings.TrimSpace(*raw) == "" {
		return nil, nil
	}
	parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(*raw))
	if err != nil {
		return nil, errors.New("expires_at must be RFC3339")
	}
	utc := parsed.UTC()
	return &utc, nil
}

func (pSrv *server) handleCreateBlogPreviewLink(c echo.Context) error {
	articleID := strings.TrimSpace(c.Param("id"))
	if articleID == "" {
		return c.String(http.StatusBadRequest, "article id is required")
	}

	var req createBlogPreviewLinkRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid request body")
	}
	expiresAt, err := parsePreviewLinkExpiry(req.ExpiresAt)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	if expiresAt != nil && !expiresAt.After(time.Now()) {
		return c.String(http.StatusBadRequest, "expires_at must be in the future")
	}
	if _, err := pSrv.q.BlogArticle.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogArticle.ID.Eq(articleID)).First(); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(http.StatusNotFound, "blog article not found")
		}
		return c.String(http.StatusInternalServerError, "failed to fetch blog article")
	}

	token, err := newPreviewToken()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to create preview token")
	}
	link := &model.BlogArticlePreviewLink{
		ArticleID: articleID,
		TokenHash: hashPreviewToken(token),
		ExpiresAt: expiresAt,
	}
	if err := pSrv.q.BlogArticlePreviewLink.WithContext(c.Request().Context()).Create(link); err != nil {
		return c.String(http.StatusInternalServerError, "failed to create preview link")
	}

	linkID := ""
	if link.ID != nil {
		linkID = *link.ID
	}
	return c.JSON(http.StatusCreated, blogPreviewLinkResponse{
		ID:        linkID,
		Token:     token,
		ExpiresAt: formatOptionalBlogTime(link.ExpiresAt),
		CreatedAt: formatBlogTime(link.CreatedAt),
	})
}

func (pSrv *server) handleGetBlogPreviewLinks(c echo.Context) error {
	articleID := strings.TrimSpace(c.Param("id"))
	if articleID == "" {
		return c.String(http.StatusBadRequest, "article id is required")
	}

	links, err := pSrv.q.BlogArticlePreviewLink.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogArticlePreviewLink.ArticleID.Eq(articleID)).
		Order(pSrv.q.BlogArticlePreviewLink.CreatedAt.Desc()).
		Find()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch preview links")
	}

	response := make([]blogPreviewLinkResponse, 0, len(links))
	for _, link := range links {
		linkID := ""
		if link.ID != nil {
			linkID = *link.ID
		}
		response = append(response, blogPreviewLinkResponse{
			ID:        linkID,
			ExpiresAt: formatOptionalBlogTime(link.ExpiresAt),
			RevokedAt: formatOptionalBlogTime(link.RevokedAt),
			CreatedAt: formatBlogTime(link.CreatedAt),
		})
	}
	return c.JSON(http.StatusOK, response)
}

func (pSrv *server) handleRevokeBlogPreviewLink(c echo.Context) error {
	articleID := strings.TrimSpace(c.Param("id"))
	linkID := strings.TrimSpace(c.Param("linkId"))
	if articleID == "" || linkID == "" {
		return c.String(http.StatusBadRequest, "article id and preview link id are required")
	}

	now := time.Now().UTC()
	result, err := pSrv.q.BlogArticlePreviewLink.WithContext(c.Request().Context()).
		Where(
			pSrv.q.BlogArticlePreviewLink.ID.Eq(linkID),
			pSrv.q.BlogArticlePreviewLink.ArticleID.Eq(articleID),
		).
		Updates(map[string]interface{}{"revoked_at": now})
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to revoke preview link")
	}
	if result.RowsAffected == 0 {
		return c.String(http.StatusNotFound, "preview link not found")
	}
	return c.NoContent(http.StatusNoContent)
}

func (pSrv *server) handleGetBlogPreview(c echo.Context) error {
	token := strings.TrimSpace(c.Param("token"))
	if token == "" {
		return c.String(http.StatusBadRequest, "preview token is required")
	}

	link, err := pSrv.q.BlogArticlePreviewLink.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogArticlePreviewLink.TokenHash.Eq(hashPreviewToken(token))).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(http.StatusNotFound, "preview not found")
		}
		return c.String(http.StatusInternalServerError, "failed to fetch preview")
	}
	if link.RevokedAt != nil || (link.ExpiresAt != nil && !link.ExpiresAt.After(time.Now())) {
		return c.String(http.StatusNotFound, "preview not found")
	}

	article, err := pSrv.withBlogArticleRelations(pSrv.q.BlogArticle.WithContext(c.Request().Context())).
		Where(pSrv.q.BlogArticle.ID.Eq(link.ArticleID)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(http.StatusNotFound, "preview not found")
		}
		return c.String(http.StatusInternalServerError, "failed to fetch preview article")
	}
	c.Response().Header().Set(echo.HeaderCacheControl, "private, no-store")
	c.Response().Header().Set("X-Robots-Tag", "noindex, nofollow")
	return c.JSON(http.StatusOK, blogArticleDetail(article, true))
}
