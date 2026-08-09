package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"realtime/internal/query/model"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

type embedRequest struct {
	Texts     []string `json:"texts"`
	InputType string   `json:"input_type"`
}

type embedResponse struct {
	Model      string      `json:"model"`
	Dimensions int         `json:"dimensions"`
	Vectors    [][]float64 `json:"vectors"`
}

type searchWorkHit struct {
	WorkID   string
	Distance float64
}

func (pSrv *server) embedQuery(ctx context.Context, queryText string) ([]float64, error) {
	if pSrv.embeddingBaseURL == "" {
		return nil, errors.New("embedding base url is not configured")
	}

	payload := embedRequest{
		Texts:     []string{queryText},
		InputType: "query",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		pSrv.embeddingBaseURL+"/embed",
		strings.NewReader(string(body)),
	)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := pSrv.httpClient
	if client == nil {
		client = http.DefaultClient
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, errors.New("embedding service returned non-200 status: " + res.Status)
	}

	var parsed embedResponse
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		return nil, err
	}
	if len(parsed.Vectors) == 0 {
		return nil, errors.New("embedding service returned empty vectors")
	}
	if parsed.Dimensions != 384 {
		return nil, errors.New("embedding vector dimensions mismatch")
	}

	return parsed.Vectors[0], nil
}

func (pSrv *server) handleSearchWorks(c echo.Context) error {
	queryText := strings.TrimSpace(c.QueryParam("q"))
	if queryText == "" {
		return c.String(http.StatusBadRequest, "query parameter 'q' is required")
	}

	limit := 10
	if rawLimit := strings.TrimSpace(c.QueryParam("limit")); rawLimit != "" {
		parsedLimit, err := strconv.Atoi(rawLimit)
		if err != nil {
			return c.String(http.StatusBadRequest, "limit must be number")
		}
		limit = parsedLimit
	}

	ctx := c.Request().Context()

	vector, err := pSrv.embedQuery(ctx, queryText)
	if err != nil {
		return c.String(http.StatusBadRequest, "failed to embed query")
	}

	hits, err := pSrv.searchWorkIDs(ctx, vector, limit)
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to search works")
	}

	if len(hits) == 0 {
		return c.JSON(http.StatusOK, []workResponse{})
	}

	workIDs := make([]string, 0, len(hits))
	for _, hit := range hits {
		workIDs = append(workIDs, hit.WorkID)
	}

	works, err := pSrv.q.IsirmtWork.WithContext(ctx).
		Where(pSrv.q.IsirmtWork.ID.In(workIDs...)).
		Find()
	if err != nil {
		return c.String(http.StatusInternalServerError, "failed to fetch works")
	}

	workByID := make(map[string]*model.IsirmtWork, len(works))
	for _, work := range works {
		if work.ID != nil {
			workByID[*work.ID] = work
		}
	}

	orderedWorks := make([]*model.IsirmtWork, 0, len(hits))
	for _, hit := range hits {
		if work := workByID[hit.WorkID]; work != nil {
			orderedWorks = append(orderedWorks, work)
		}
	}

	return pSrv.respondWorks(c, orderedWorks)
}

func formatVector(vector []float64) string {
	parts := make([]string, 0, len(vector))
	for _, value := range vector {
		parts = append(parts, strconv.FormatFloat(value, 'f', -1, 64))
	}
	return "[" + strings.Join(parts, ",") + "]"
}

func (pSrv *server) searchWorkIDs(ctx context.Context, vector []float64, limit int) ([]searchWorkHit, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	vectorText := formatVector(vector)

	type row struct {
		WorkID   string  `gorm:"column:work_id"`
		Distance float64 `gorm:"column:distance"`
	}

	var rows []row
	err := pSrv.db.WithContext(ctx).Raw(
		`
		SELECT
			work_id,
			MIN(embedding <=> ?::vector) AS distance
		FROM isirmt_work_search_chunks
		WHERE embedding_model = ?
		GROUP BY work_id
		ORDER BY distance ASC
		LIMIT ?
		`,
		vectorText,
		pSrv.searchEmbeddingModel,
		limit,
	).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	hits := make([]searchWorkHit, 0, len(rows))
	for _, row := range rows {
		hits = append(hits, searchWorkHit{
			WorkID:   row.WorkID,
			Distance: row.Distance,
		})
	}

	return hits, nil
}
