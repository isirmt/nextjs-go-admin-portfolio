package main

import (
	"errors"
	"fmt"
	"net/http"
	"realtime/internal/query"
	"realtime/internal/query/model"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type blogSeriesRequest struct {
	Title       string   `json:"title"`
	Slug        string   `json:"slug"`
	Description *string  `json:"description"`
	ArticleIDs  []string `json:"article_ids"`
}

type blogSeriesInput struct {
	title       string
	slug        string
	description *string
	articleIDs  []string
}

type blogSeriesResponse struct {
	ID          string                       `json:"id"`
	Title       string                       `json:"title"`
	Slug        string                       `json:"slug"`
	Description *string                      `json:"description"`
	CreatedAt   string                       `json:"created_at"`
	UpdatedAt   string                       `json:"updated_at"`
	Articles    []blogArticleSummaryResponse `json:"articles"`
}

func parseBlogSeriesInput(req blogSeriesRequest) (blogSeriesInput, error) {
	title := strings.TrimSpace(req.Title)
	if title == "" {
		return blogSeriesInput{}, errors.New("title is required")
	}

	slug := strings.ToLower(strings.TrimSpace(req.Slug))
	if !blogSlugPattern.MatchString(slug) {
		return blogSeriesInput{}, errors.New("slug must contain lowercase letters, numbers, and hyphens only")
	}

	var description *string
	if req.Description != nil {
		trimmed := strings.TrimSpace(*req.Description)
		if trimmed != "" {
			description = &trimmed
		}
	}

	articleIDs := make([]string, 0, len(req.ArticleIDs))
	seen := make(map[string]struct{}, len(req.ArticleIDs))
	for _, rawID := range req.ArticleIDs {
		articleID := strings.TrimSpace(rawID)
		if articleID == "" {
			return blogSeriesInput{}, errors.New("article_ids must not contain empty values")
		}
		if _, exists := seen[articleID]; exists {
			return blogSeriesInput{}, errors.New("article_ids must not contain duplicates")
		}
		seen[articleID] = struct{}{}
		articleIDs = append(articleIDs, articleID)
	}

	return blogSeriesInput{
		title:       title,
		slug:        slug,
		description: description,
		articleIDs:  articleIDs,
	}, nil
}

func isPublicBlogArticle(article *model.BlogArticle, now time.Time) bool {
	return article != nil &&
		article.Status != nil && *article.Status == blogArticleStatusPublished &&
		article.PublishedAt != nil && !article.PublishedAt.After(now)
}

func blogSeriesSummary(series *model.BlogSeries, includeDrafts bool) blogSeriesResponse {
	seriesID := ""
	if series.ID != nil {
		seriesID = *series.ID
	}

	entries := append([]*model.BlogSeriesArticle(nil), series.ArticleEntries...)
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].DisplayOrder < entries[j].DisplayOrder
	})

	now := time.Now()
	articles := make([]blogArticleSummaryResponse, 0, len(entries))
	for _, entry := range entries {
		if entry == nil || entry.Article == nil {
			continue
		}
		if !includeDrafts && !isPublicBlogArticle(entry.Article, now) {
			continue
		}
		articles = append(articles, blogArticleSummary(entry.Article, includeDrafts))
	}

	return blogSeriesResponse{
		ID:          seriesID,
		Title:       series.Title,
		Slug:        series.Slug,
		Description: series.Description,
		CreatedAt:   formatBlogTime(series.CreatedAt),
		UpdatedAt:   formatBlogTime(series.UpdatedAt),
		Articles:    articles,
	}
}

func (pSrv *server) withBlogSeriesArticles(seriesQuery query.IBlogSeriesDo) query.IBlogSeriesDo {
	return seriesQuery.
		Preload(pSrv.q.BlogSeries.ArticleEntries).
		Preload(pSrv.q.BlogSeries.ArticleEntries.Article).
		Preload(pSrv.q.BlogSeries.ArticleEntries.Article.Tags)
}

func (pSrv *server) ensureBlogSeriesSlugAvailable(c *echo.Context, slug, ignoredSeriesID string) error {
	series, err := pSrv.q.BlogSeries.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogSeries.Slug.Eq(slug)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	if series.ID == nil || *series.ID != ignoredSeriesID {
		return echo.NewHTTPError(http.StatusConflict, "slug is already in use")
	}
	return nil
}

func validateBlogSeriesArticleIDs(c *echo.Context, q *query.Query, articleIDs []string) error {
	if len(articleIDs) == 0 {
		return nil
	}
	count, err := q.BlogArticle.WithContext(c.Request().Context()).
		Where(q.BlogArticle.ID.In(articleIDs...)).Count()
	if err != nil {
		return fmt.Errorf("validate series articles: %w", err)
	}
	if int(count) != len(articleIDs) {
		return echo.NewHTTPError(http.StatusBadRequest, "unknown blog article id provided")
	}
	return nil
}

func syncBlogSeriesArticles(c *echo.Context, tx *query.Query, seriesID string, articleIDs []string) error {
	if _, err := tx.BlogSeriesArticle.WithContext(c.Request().Context()).
		Where(tx.BlogSeriesArticle.SeriesID.Eq(seriesID)).Delete(); err != nil {
		return err
	}
	if len(articleIDs) == 0 {
		return nil
	}

	entries := make([]*model.BlogSeriesArticle, 0, len(articleIDs))
	for index, articleID := range articleIDs {
		entries = append(entries, &model.BlogSeriesArticle{
			SeriesID:     seriesID,
			ArticleID:    articleID,
			DisplayOrder: int32(index),
		})
	}
	return tx.BlogSeriesArticle.WithContext(c.Request().Context()).Create(entries...)
}

func (pSrv *server) handleGetBlogSeries(c *echo.Context) error {
	isAdmin := pSrv.isAdminRequest(c)
	seriesQuery := pSrv.withBlogSeriesArticles(pSrv.q.BlogSeries.WithContext(c.Request().Context())).
		Order(pSrv.q.BlogSeries.UpdatedAt.Desc())

	identifier := strings.TrimSpace(c.Param("identifier"))
	if identifier != "" {
		if _, err := uuid.Parse(identifier); err == nil {
			seriesQuery = seriesQuery.Where(pSrv.q.BlogSeries.ID.Eq(identifier))
		} else {
			seriesQuery = seriesQuery.Where(pSrv.q.BlogSeries.Slug.Eq(strings.ToLower(identifier)))
		}
		series, err := seriesQuery.First()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return c.String(http.StatusNotFound, "blog series not found")
			}
			return c.String(http.StatusInternalServerError, "failed to fetch blog series")
		}
		response := blogSeriesSummary(series, isAdmin)
		if !isAdmin && len(response.Articles) == 0 {
			return c.String(http.StatusNotFound, "blog series not found")
		}
		return c.JSON(http.StatusOK, response)
	}

	series, err := seriesQuery.Find()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch blog series")
	}
	response := make([]blogSeriesResponse, 0, len(series))
	for _, item := range series {
		summary := blogSeriesSummary(item, isAdmin)
		if !isAdmin && len(summary.Articles) == 0 {
			continue
		}
		response = append(response, summary)
	}
	return c.JSON(http.StatusOK, response)
}

func (pSrv *server) handleCreateBlogSeries(c *echo.Context) error {
	var req blogSeriesRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid request body")
	}
	input, err := parseBlogSeriesInput(req)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	if err := pSrv.ensureBlogSeriesSlugAvailable(c, input.slug, ""); err != nil {
		return err
	}
	if err := validateBlogSeriesArticleIDs(c, pSrv.q, input.articleIDs); err != nil {
		return err
	}

	series := &model.BlogSeries{
		Title:       input.title,
		Slug:        input.slug,
		Description: input.description,
	}
	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if err := tx.BlogSeries.WithContext(c.Request().Context()).Create(series); err != nil {
			return err
		}
		if series.ID == nil {
			return errors.New("failed to generate blog series id")
		}
		return syncBlogSeriesArticles(c, tx, *series.ID, input.articleIDs)
	}); err != nil {
		return c.String(http.StatusInternalServerError, "failed to create blog series")
	}

	createdSeries, err := pSrv.withBlogSeriesArticles(pSrv.q.BlogSeries.WithContext(c.Request().Context())).
		Where(pSrv.q.BlogSeries.ID.Eq(*series.ID)).First()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch created blog series")
	}
	return c.JSON(http.StatusCreated, blogSeriesSummary(createdSeries, true))
}

func (pSrv *server) handleUpdateBlogSeries(c *echo.Context) error {
	seriesID := strings.TrimSpace(c.Param("id"))
	if seriesID == "" {
		return c.String(http.StatusBadRequest, "series id is required")
	}

	var req blogSeriesRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid request body")
	}
	input, err := parseBlogSeriesInput(req)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	if _, err := pSrv.q.BlogSeries.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogSeries.ID.Eq(seriesID)).First(); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(http.StatusNotFound, "blog series not found")
		}
		return c.String(http.StatusInternalServerError, "failed to fetch blog series")
	}
	if err := pSrv.ensureBlogSeriesSlugAvailable(c, input.slug, seriesID); err != nil {
		return err
	}
	if err := validateBlogSeriesArticleIDs(c, pSrv.q, input.articleIDs); err != nil {
		return err
	}

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if _, err := tx.BlogSeries.WithContext(c.Request().Context()).
			Where(tx.BlogSeries.ID.Eq(seriesID)).Updates(map[string]interface{}{
			"title":       input.title,
			"slug":        input.slug,
			"description": input.description,
		}); err != nil {
			return err
		}
		return syncBlogSeriesArticles(c, tx, seriesID, input.articleIDs)
	}); err != nil {
		return c.String(http.StatusInternalServerError, "failed to update blog series")
	}

	updatedSeries, err := pSrv.withBlogSeriesArticles(pSrv.q.BlogSeries.WithContext(c.Request().Context())).
		Where(pSrv.q.BlogSeries.ID.Eq(seriesID)).First()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch updated blog series")
	}
	return c.JSON(http.StatusOK, blogSeriesSummary(updatedSeries, true))
}

func (pSrv *server) handleDeleteBlogSeries(c *echo.Context) error {
	seriesID := strings.TrimSpace(c.Param("id"))
	if seriesID == "" {
		return c.String(http.StatusBadRequest, "series id is required")
	}
	result, err := pSrv.q.BlogSeries.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogSeries.ID.Eq(seriesID)).Delete()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to delete blog series")
	}
	if result.RowsAffected == 0 {
		return c.String(http.StatusNotFound, "blog series not found")
	}
	return c.NoContent(http.StatusNoContent)
}
