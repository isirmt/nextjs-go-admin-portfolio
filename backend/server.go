package main

import (
	"net/http"
	"realtime/internal/query"

	"github.com/labstack/echo/v4"
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
	httpClient           *http.Client
	clickLimiter         *clickLimiter
	wsHub                *wsHub
	wsSeq                uint64
}

func (pSrv *server) handleHealth(c echo.Context) error {
	return c.String(200, "ok")
}
