package main

import (
	"crypto/subtle"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func (pSrv *server) isAdminRequest(c *echo.Context) bool {
	secret := c.Request().Header.Get("X-Admin-Secret")
	if secret == "" || pSrv.adminSecret == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(secret), []byte(pSrv.adminSecret)) == 1
}

func (pSrv *server) requireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		if !pSrv.isAdminRequest(c) {
			return c.String(http.StatusForbidden, "admin authentication failed")
		}
		return next(c)
	}
}

func corsConfig(allowedOrigin string) middleware.CORSConfig {
	cfg := middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}

	if allowedOrigin != "" && allowedOrigin != "*" {
		cfg.AllowOrigins = []string{allowedOrigin}
	}

	return cfg
}
