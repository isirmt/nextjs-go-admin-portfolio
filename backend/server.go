package main

import (
	"context"
	"net/http"
	"realtime/internal/query"
	"time"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type server struct {
	db                   *gorm.DB
	q                    *query.Query
	uploadDir            string
	allowedOrigin        string
	maxUploadSize        uint32
	adminSecret          string
	embeddingBaseURL     string
	searchEmbeddingModel string
	indexNowEnabled      bool
	httpClient           *http.Client
	clickLimiter         *clickLimiter
	wsHub                *wsHub
	wsSeq                uint64
}

func (pSrv *server) handleHealth(c *echo.Context) error {
	sqlDb, err := pSrv.db.DB()
	if err != nil {
		return c.String(http.StatusServiceUnavailable, "service unavailable")
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), 2*time.Second)
	defer cancel()

	if err := sqlDb.PingContext(ctx); err != nil {
		return c.String(http.StatusServiceUnavailable, "service failed")
	}

	return c.String(http.StatusOK, "ok")
}
