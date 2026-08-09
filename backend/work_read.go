package main

import (
	"net/http"
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

func (pSrv *server) respondWorks(c echo.Context, works []*model.IsirmtWork) error {
	ctx := c.Request().Context()

	if len(works) == 0 {
		return c.JSON(http.StatusOK, []workResponse{})
	}

	workIDs := make([]string, 0, len(works))
	for _, work := range works {
		if work.ID != nil {
			workIDs = append(workIDs, *work.ID)
		}
	}

	if len(workIDs) == 0 {
		return c.JSON(http.StatusOK, []workResponse{})
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
		if work.ID == nil {
			continue
		}

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

func (pSrv *server) handleGetWorks(c echo.Context) error {
	ctx := c.Request().Context()

	works, err := pSrv.q.IsirmtWork.WithContext(ctx).Order(pSrv.q.IsirmtWork.CreatedAt.Desc()).Find()
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
	works, err := pSrv.q.IsirmtWork.WithContext(ctx).
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
