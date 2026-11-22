package main

import (
	"net/http"
	"realtime/internal/query/model"
	"strings"

	"github.com/labstack/echo/v5"
)

type blogSearchResponse struct {
	blogArticleSummaryResponse
	SearchMatch searchMatch `json:"search_match"`
}

func (pSrv *server) handleSearchBlogs(c *echo.Context) error {
	queryText := strings.TrimSpace(c.QueryParam("q"))
	if queryText == "" {
		return c.String(http.StatusBadRequest, "query parameter 'q' is required")
	}
	if len([]rune(queryText)) > 200 {
		return c.String(http.StatusBadRequest, "query is too long")
	}
	ctx := c.Request().Context()
	vector, err := pSrv.embedQuery(ctx, queryText)
	if err != nil {
		return c.String(http.StatusServiceUnavailable, "failed to embed query")
	}

	type hit struct {
		ArticleID string `gorm:"column:article_id"`
		Heading   string `gorm:"column:heading"`
		Content   string `gorm:"column:content"`
	}
	var hits []hit
	err = pSrv.db.WithContext(ctx).Raw(`
		SELECT article_id, heading, display_content AS content FROM (
			SELECT DISTINCT ON (chunks.article_id)
				chunks.article_id, chunks.heading, chunks.display_content,
				chunks.embedding <=> ?::vector AS distance
			FROM blog_search_chunks AS chunks
			JOIN blog_articles AS articles ON articles.id = chunks.article_id
			WHERE chunks.embedding_model = ?
			  AND articles.status = 'published'
			  AND articles.published_at <= NOW()
			ORDER BY chunks.article_id, distance ASC, chunks.chunk_index ASC
		) AS closest
		ORDER BY distance ASC, article_id ASC
		LIMIT 20
	`, formatVector(vector), pSrv.searchEmbeddingModel).Scan(&hits).Error
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to search blogs")
	}
	if len(hits) == 0 {
		return c.JSON(http.StatusOK, []blogSearchResponse{})
	}
	ids := make([]string, 0, len(hits))
	for _, item := range hits {
		ids = append(ids, item.ArticleID)
	}
	articles, err := pSrv.withBlogArticleTags(pSrv.q.BlogArticle.WithContext(ctx)).
		Where(pSrv.q.BlogArticle.ID.In(ids...)).Find()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch blog articles")
	}
	byID := make(map[string]*model.BlogArticle, len(articles))
	for _, article := range articles {
		if article.ID != nil {
			byID[*article.ID] = article
		}
	}
	responses := make([]blogSearchResponse, 0, len(hits))
	for _, item := range hits {
		if article := byID[item.ArticleID]; article != nil {
			responses = append(responses, blogSearchResponse{
				blogArticleSummaryResponse: blogArticleSummary(article, false),
				SearchMatch:                searchMatch{Label: item.Heading, Content: item.Content},
			})
		}
	}
	return c.JSON(http.StatusOK, responses)
}
