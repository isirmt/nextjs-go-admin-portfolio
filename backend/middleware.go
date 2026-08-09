package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func (pSrv *server) requireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		secret := c.Request().Header.Get("X-Admin-Secret")
		if secret == "" || secret != pSrv.adminSecret {
			return c.String(http.StatusForbidden, "admin authentication failed")
		}
		return next(c)
	}
}

func corsConfig(allowedOrigin string) middleware.CORSConfig {
	cfg := middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}

	if allowedOrigin != "" && allowedOrigin != "*" {
		cfg.AllowOrigins = []string{allowedOrigin}
	}

	return cfg
}
