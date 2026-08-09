package main

import (
	"net/http"
	"realtime/internal/query"
	"realtime/internal/query/model"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

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

type workResponse struct {
	ID               string                   `json:"id"`
	Title            string                   `json:"title"`
	Comment          string                   `json:"comment"`
	CreatedAt        string                   `json:"created_at"`
	AccentColor      string                   `json:"accent_color"`
	Description      *string                  `json:"description"`
	ThumbnailImageID *string                  `json:"thumbnail_image_id"`
	Images           []workImageResponse      `json:"images"`
	Urls             []workURLResponse        `json:"urls"`
	TechStacks       []*model.CommonTechStack `json:"tech_stacks"`
}

func (pSrv *server) withWorkRelations(workQuery query.IIsirmtWorkDo) query.IIsirmtWorkDo {
	return workQuery.Preload(
		pSrv.q.IsirmtWork.WorkImages.Order(pSrv.q.IsirmtWorkImage.DisplayOrder),
		pSrv.q.IsirmtWork.URLs.Order(pSrv.q.IsirmtWorkURL.DisplayOrder),
		pSrv.q.IsirmtWork.TechStacks,
	)
}

func (pSrv *server) respondWorks(c echo.Context, works []*model.IsirmtWork) error {
	responses := make([]workResponse, 0, len(works))
	for _, work := range works {
		if work.ID == nil {
			continue
		}

		createdAt := ""
		if work.CreatedAt != nil {
			createdAt = work.CreatedAt.UTC().Format(time.RFC3339Nano)
		}

		workID := *work.ID
		images := make([]workImageResponse, 0, len(work.WorkImages))
		for _, image := range work.WorkImages {
			images = append(images, workImageResponse{
				ID:           *image.ID,
				ImageID:      image.ImageID,
				DisplayOrder: int(image.DisplayOrder),
			})
		}

		urls := make([]workURLResponse, 0, len(work.URLs))
		for _, url := range work.URLs {
			urls = append(urls, workURLResponse{
				ID:           *url.ID,
				URL:          url.URL,
				Label:        url.Label,
				DisplayOrder: int(url.DisplayOrder),
			})
		}

		techStacks := work.TechStacks
		if techStacks == nil {
			techStacks = []*model.CommonTechStack{}
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
			TechStacks:       techStacks,
		})
	}

	return c.JSON(http.StatusOK, responses)
}

func (pSrv *server) handleGetWorks(c echo.Context) error {
	ctx := c.Request().Context()

	works, err := pSrv.withWorkRelations(pSrv.q.IsirmtWork.WithContext(ctx)).
		Order(pSrv.q.IsirmtWork.CreatedAt.Desc()).
		Find()
	if err != nil {
		return c.String(500, "failed to fetch works")
	}

	return pSrv.respondWorks(c, works)
}

func (pSrv *server) handleGetRankingWorks(c echo.Context) error {
	limit := 10
	if rawLimit := strings.TrimSpace(c.QueryParam("limit")); rawLimit != "" {
		parsedLimit, err := strconv.Atoi(rawLimit)
		if err != nil {
			return c.String(http.StatusBadRequest, "limit must be number")
		}
		limit = parsedLimit
	}

	ctx := c.Request().Context()
	works, err := pSrv.withWorkRelations(pSrv.q.IsirmtWork.WithContext(ctx)).
		LeftJoin(pSrv.q.IsirmtWorkClick, pSrv.q.IsirmtWorkClick.WorkID.EqCol(pSrv.q.IsirmtWork.ID)).
		Group(pSrv.q.IsirmtWork.ID).
		Order(pSrv.q.IsirmtWorkClick.ID.Count().Desc()).
		Order(pSrv.q.IsirmtWork.CreatedAt.Desc()).
		Limit(limit).
		Find()
	if err != nil {
		return c.String(500, "failed to fetch ranking works")
	}

	return pSrv.respondWorks(c, works)
}
