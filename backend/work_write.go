package main

import (
	"context"
	"errors"
	"net/http"
	"realtime/internal/query"
	"realtime/internal/query/model"
	"regexp"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type createWorkURL struct {
	Label string `json:"label"`
	URL   string `json:"url"`
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

type workRelations struct {
	imageIDs     []string
	techStackIDs []string
	urls         []createWorkURL
}

var hexColorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

func createWorkRelations(ctx context.Context, tx *query.Query, workID string, relations workRelations) error {
	if len(relations.imageIDs) > 0 {
		images := make([]*model.IsirmtWorkImage, 0, len(relations.imageIDs))
		for index, imageID := range relations.imageIDs {
			images = append(images, &model.IsirmtWorkImage{
				WorkID:       workID,
				ImageID:      imageID,
				DisplayOrder: int32(index),
			})
		}
		if err := tx.IsirmtWorkImage.WithContext(ctx).Create(images...); err != nil {
			return err
		}
	}

	if len(relations.urls) > 0 {
		urls := make([]*model.IsirmtWorkURL, 0, len(relations.urls))
		for index, entry := range relations.urls {
			urls = append(urls, &model.IsirmtWorkURL{
				WorkID:       workID,
				Label:        entry.Label,
				URL:          entry.URL,
				DisplayOrder: int32(index),
			})
		}
		if err := tx.IsirmtWorkURL.WithContext(ctx).Create(urls...); err != nil {
			return err
		}
	}

	techStacks := make([]*model.IsirmtWorkTechStack, 0, len(relations.techStackIDs))
	for _, techStackID := range relations.techStackIDs {
		techStacks = append(techStacks, &model.IsirmtWorkTechStack{
			WorkID:      workID,
			TechStackID: techStackID,
		})
	}
	if len(techStacks) > 0 {
		return tx.IsirmtWorkTechStack.WithContext(ctx).Create(techStacks...)
	}

	return nil
}

func replaceWorkRelations(ctx context.Context, tx *query.Query, workID string, relations workRelations) error {
	if _, err := tx.IsirmtWorkImage.WithContext(ctx).Where(tx.IsirmtWorkImage.WorkID.Eq(workID)).Delete(); err != nil {
		return err
	}
	if _, err := tx.IsirmtWorkURL.WithContext(ctx).Where(tx.IsirmtWorkURL.WorkID.Eq(workID)).Delete(); err != nil {
		return err
	}
	if _, err := tx.IsirmtWorkTechStack.WithContext(ctx).Where(tx.IsirmtWorkTechStack.WorkID.Eq(workID)).Delete(); err != nil {
		return err
	}

	return createWorkRelations(ctx, tx, workID, relations)
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
	searchDirty := true

	work := &model.IsirmtWork{
		Title:            title,
		Comment:          comment,
		AccentColor:      &accentCopy,
		Description:      descriptionPtr,
		ThumbnailImageID: &thumbnailCopy,
		CreatedAt:        &publishedTime,
		SearchDirty:      &searchDirty,
	}
	relations := workRelations{
		imageIDs:     workImageIDs,
		techStackIDs: techStackIDs,
		urls:         filteredUrls,
	}

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if err := tx.IsirmtWork.WithContext(ctx).Create(work); err != nil {
			return err
		}
		if work.ID == nil {
			return errors.New("failed to generate work id")
		}
		workID := *work.ID

		return createWorkRelations(ctx, tx, workID, relations)
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
	relations := workRelations{
		imageIDs:     workImageIDs,
		techStackIDs: techStackIDs,
		urls:         filteredUrls,
	}

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if _, err := tx.IsirmtWork.WithContext(ctx).Where(tx.IsirmtWork.ID.Eq(workID)).Updates(map[string]interface{}{
			"title":              title,
			"comment":            comment,
			"accent_color":       accentColor,
			"description":        descriptionPtr,
			"thumbnail_image_id": thumbnailID,
			"created_at":         publishedTime,
			"search_dirty":       true,
			"search_index_error": nil,
		}); err != nil {
			return err
		}

		return replaceWorkRelations(ctx, tx, workID, relations)
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
