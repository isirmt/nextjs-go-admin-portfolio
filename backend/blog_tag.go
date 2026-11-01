package main

import (
	"errors"
	"net/http"
	"realtime/internal/query/model"
	"strings"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type createBlogTagRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type blogTagResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

func blogTagSummary(tag *model.BlogTag) blogTagResponse {
	id := ""
	if tag.ID != nil {
		id = *tag.ID
	}
	return blogTagResponse{
		ID:   id,
		Name: tag.Name,
		Slug: tag.Slug,
	}
}

func (pSrv *server) handleGetBlogTags(c *echo.Context) error {
	tags, err := pSrv.q.BlogTag.WithContext(c.Request().Context()).
		Order(pSrv.q.BlogTag.Name.Asc()).
		Find()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch blog tags")
	}

	response := make([]blogTagResponse, 0, len(tags))
	for _, tag := range tags {
		response = append(response, blogTagSummary(tag))
	}
	return c.JSON(http.StatusOK, response)
}

func (pSrv *server) handleGetBlogTag(c *echo.Context) error {
	tagID := strings.TrimSpace(c.Param("id"))
	if tagID == "" {
		return c.String(http.StatusBadRequest, "blog tag id is required")
	}

	tag, err := pSrv.q.BlogTag.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogTag.ID.Eq(tagID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(http.StatusNotFound, "blog tag not found")
		}
		return c.String(http.StatusInternalServerError, "failed to fetch blog tag")
	}
	return c.JSON(http.StatusOK, blogTagSummary(tag))
}

func (pSrv *server) handleCreateBlogTag(c *echo.Context) error {
	var req createBlogTagRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid request body")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return c.String(http.StatusBadRequest, "name is required")
	}
	slug := strings.ToLower(strings.TrimSpace(req.Slug))
	if !blogSlugPattern.MatchString(slug) {
		return c.String(http.StatusBadRequest, "slug must contain lowercase letters, numbers, and hyphens only")
	}

	existingTag, err := pSrv.q.BlogTag.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogTag.Name.Eq(name)).
		First()
	if err == nil && existingTag != nil {
		return c.String(http.StatusConflict, "blog tag name is already in use")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusInternalServerError, "failed to validate blog tag")
	}

	existingTag, err = pSrv.q.BlogTag.WithContext(c.Request().Context()).
		Where(pSrv.q.BlogTag.Slug.Eq(slug)).
		First()
	if err == nil && existingTag != nil {
		return c.String(http.StatusConflict, "blog tag slug is already in use")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusInternalServerError, "failed to validate blog tag")
	}

	tag := &model.BlogTag{Name: name, Slug: slug}
	if err := pSrv.q.BlogTag.WithContext(c.Request().Context()).Create(tag); err != nil {
		return c.String(http.StatusInternalServerError, "failed to create blog tag")
	}
	return c.JSON(http.StatusCreated, blogTagSummary(tag))
}
