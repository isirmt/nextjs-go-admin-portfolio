package main

import (
	"errors"
	"net/http"
	"realtime/internal/query/model"
	"strings"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type createTechStackRequest struct {
	Name string `json:"name"`
}

func (pSrv *server) handleGetTechStacks(c echo.Context) error {
	ctx := c.Request().Context()
	stacks, err := pSrv.q.CommonTechStack.WithContext(ctx).Order(pSrv.q.CommonTechStack.Name).Find()
	if err != nil {
		return c.String(500, "failed to fetch tech stacks")
	}

	return c.JSON(200, stacks)
}

func (pSrv *server) handleGetTechStack(c echo.Context) error {
	stackID := c.Param("id")
	if stackID == "" {
		return c.String(400, "tech stack id is required")
	}

	ctx := c.Request().Context()
	stack, err := pSrv.q.CommonTechStack.WithContext(ctx).Where(pSrv.q.CommonTechStack.ID.Eq(stackID)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "tech stack not found")
		}
		return c.String(500, "failed to fetch tech stack")
	}

	return c.JSON(200, stack)
}

func (pSrv *server) handleCreateTechStack(c echo.Context) error {
	var req createTechStackRequest
	if err := c.Bind(&req); err != nil {
		return c.String(400, "invalid request body")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return c.String(400, "name is required")
	}

	ctx := c.Request().Context()

	newStack := &model.CommonTechStack{
		Name: name,
	}

	if err := pSrv.q.CommonTechStack.WithContext(ctx).Create(newStack); err != nil {
		return c.String(500, "failed to create tech stack")
	}

	return c.JSON(http.StatusCreated, newStack)
}
