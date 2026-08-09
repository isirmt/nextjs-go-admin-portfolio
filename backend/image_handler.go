package main

import (
	"context"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"realtime/internal/query"
	"realtime/internal/query/model"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func (pSrv *server) handleGetImages(c echo.Context) error {
	images, err := pSrv.q.CommonImage.WithContext(c.Request().Context()).Find()
	if err != nil {
		return c.String(500, "internal server error")
	}
	return c.JSON(200, images)
}

func (pSrv *server) handleGetImage(c echo.Context) error {
	imageID := c.Param("id")
	if imageID == "" {
		return c.String(400, "image id is required")
	}

	ctx := c.Request().Context()
	image, err := pSrv.fetchImageByID(ctx, imageID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "image not found")
		}
		return c.String(500, "failed to fetch image")
	}

	return c.JSON(200, image)
}

func (pSrv *server) handleUploadImage(c echo.Context) error {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.String(400, "file is required")
	}
	if fileHeader.Size > 0 && fileHeader.Size > int64(pSrv.maxUploadSize) {
		return c.String(http.StatusRequestEntityTooLarge, "file too large")
	}

	src, err := fileHeader.Open()
	if err != nil {
		return c.String(500, "failed to open file")
	}
	defer src.Close()

	imageId, err := uuid.NewRandom()
	if err != nil {
		return c.String(500, "failed to generate image id")
	}

	idStr := imageId.String()

	storageName := idStr + filepath.Ext(fileHeader.Filename)
	dstPath := filepath.Join(pSrv.uploadDir, storageName)
	dst, err := os.Create(dstPath)
	if err != nil {
		return c.String(500, "failed to create file")
	}
	defer dst.Close()

	limit := int64(pSrv.maxUploadSize) + 1
	size, err := io.Copy(dst, io.LimitReader(src, limit))
	if err != nil {
		return c.String(500, "failed to save file")
	}

	if size > int64(pSrv.maxUploadSize) {
		_ = dst.Close()
		_ = os.Remove(dstPath)
		return c.String(http.StatusRequestEntityTooLarge, "file too large")
	}

	if _, err := dst.Seek(0, io.SeekStart); err != nil {
		return c.String(500, "failed to read saved file")
	}

	_ = dst.Sync()

	newImage := &model.CommonImage{
		ID:       &idStr,
		FileName: fileHeader.Filename,
		FilePath: storageName,
		MimeType: fileHeader.Header.Get("Content-Type"),
		FileSize: size,
	}
	if err := pSrv.q.CommonImage.WithContext(c.Request().Context()).Create(newImage); err != nil {
		return c.String(500, "failed to save image info")
	}

	return c.JSON(200, newImage)
}

func (pSrv *server) handleServeImage(c echo.Context) error {
	imageID := c.Param("id")
	if imageID == "" {
		return c.String(400, "image id is required")
	}

	ctx := c.Request().Context()
	image, err := pSrv.fetchImageByID(ctx, imageID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "image not found")
		}
		return c.String(500, "failed to fetch image")
	}

	return pSrv.serveImageContent(c, image)
}

func (pSrv *server) fetchImageByID(ctx context.Context, imageID string) (*model.CommonImage, error) {
	return pSrv.q.CommonImage.WithContext(ctx).Where(pSrv.q.CommonImage.ID.Eq(imageID)).First()
}

func (pSrv *server) serveImageContent(c echo.Context, image *model.CommonImage) error {
	filePath := filepath.Join(pSrv.uploadDir, image.FilePath)
	file, err := os.Open(filePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return c.String(404, "image file missing")
		}
		return c.String(500, "failed to open image")
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return c.String(500, "failed to read image info")
	}

	c.Response().Header().Set(echo.HeaderContentType, image.MimeType)
	c.Response().Header().Set(echo.HeaderContentLength, strconv.FormatInt(image.FileSize, 10))
	c.Response().Header().Set(echo.HeaderCacheControl, "public, max-age=31536000")

	http.ServeContent(c.Response(), c.Request(), image.FileName, fileInfo.ModTime(), file)
	return nil
}

func (pSrv *server) handleDeleteImage(c echo.Context) error {
	imageID := strings.TrimSpace(c.Param("id"))
	if imageID == "" {
		return c.String(400, "image id is required")
	}

	ctx := c.Request().Context()
	if _, err := pSrv.q.CommonImage.WithContext(ctx).Where(pSrv.q.CommonImage.ID.Eq(imageID)).First(); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(404, "image not found")
		}
		return c.String(500, "failed to fetch image")
	}

	if err := pSrv.q.Transaction(func(tx *query.Query) error {
		if _, err := tx.CommonImage.WithContext(ctx).Where(tx.CommonImage.ID.Eq(imageID)).Delete(); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return c.String(500, "failed to delete image")
	}
	return c.String(200, "ok")
}
