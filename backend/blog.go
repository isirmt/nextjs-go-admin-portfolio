package main

import (
	"errors"
	"net/http"
	"realtime/internal/query"
	"realtime/internal/query/model"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

const blogArticleStatusPublished = "published"

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
