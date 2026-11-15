package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"gorm.io/gorm"
)

const (
	indexNowEndpoint = "https://api.indexnow.org/indexnow"
	indexNowHost     = "isirmt.com"
	indexNowKey      = "7b9d02af1a0e46c68c3796230a74f222"
	indexNowKeyURL   = "https://isirmt.com/7b9d02af1a0e46c68c3796230a74f222.txt"

	indexNowNotificationInterval  = 5 * time.Minute
	indexNowNotificationBatchSize = 20
)

type indexNowRequest struct {
	Host        string   `json:"host"`
	Key         string   `json:"key"`
	KeyLocation string   `json:"keyLocation"`
	URLList     []string `json:"urlList"`
}

func (pSrv *server) submitIndexNow(ctx context.Context, urls []string) error {
	if !pSrv.indexNowEnabled {
		return nil
	}

	urlList, err := normalizeIndexNowURLs(urls)
	if err != nil || len(urlList) == 0 {
		return err
	}

	payload, err := json.Marshal(indexNowRequest{
		Host:        indexNowHost,
		Key:         indexNowKey,
		KeyLocation: indexNowKeyURL,
		URLList:     urlList,
	})
	if err != nil {
		return fmt.Errorf("marshal IndexNow request: %w", err)
	}

	requestCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(
		requestCtx,
		http.MethodPost,
		indexNowEndpoint,
		bytes.NewReader(payload),
	)
	if err != nil {
		return fmt.Errorf("create IndexNow request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json; charset=utf-8")

	client := pSrv.httpClient
	if client == nil {
		client = http.DefaultClient
	}
	res, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("send IndexNow request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode < http.StatusOK || res.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("IndexNow returned %s", res.Status)
	}

	return nil
}

func (pSrv *server) enqueueIndexNowNotification(articleID string, urls []string) {
	if !pSrv.indexNowEnabled || len(urls) == 0 {
		return
	}

	go func() {
		pSrv.sendIndexNowNotification(context.Background(), articleID, urls)
	}()
}

func (pSrv *server) startIndexNowNotifier(ctx context.Context) {
	if !pSrv.indexNowEnabled {
		return
	}

	go func() {
		pSrv.notifyPendingIndexNow(ctx)

		ticker := time.NewTicker(indexNowNotificationInterval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				pSrv.notifyPendingIndexNow(ctx)
			}
		}
	}()
}

func (pSrv *server) notifyPendingIndexNow(ctx context.Context) {
	articles, err := pSrv.q.BlogArticle.WithContext(ctx).
		Where(
			pSrv.q.BlogArticle.Status.Eq(blogArticleStatusPublished),
			pSrv.q.BlogArticle.PublishedAt.Lte(time.Now()),
			pSrv.q.BlogArticle.IndexnowNotifiedAt.IsNull(),
		).
		Order(pSrv.q.BlogArticle.PublishedAt.Asc()).
		Limit(indexNowNotificationBatchSize).
		Find()
	if err != nil {
		log.Printf("failed to find pending IndexNow notifications: %v", err)
		return
	}

	for _, article := range articles {
		if article.ID == nil {
			continue
		}
		pSrv.sendIndexNowNotification(ctx, *article.ID, []string{blogArticleURL(article)})
	}
}

func (pSrv *server) sendIndexNowNotification(ctx context.Context, articleID string, urls []string) {
	if err := pSrv.submitIndexNow(ctx, urls); err != nil {
		log.Printf("failed to submit IndexNow notification: %v", err)
		return
	}
	if articleID == "" {
		return
	}

	notifiedAt := time.Now().UTC()
	err := pSrv.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("SET LOCAL isirmt.skip_blog_article_updated_at = 'true'").Error; err != nil {
			return err
		}
		return tx.Table("blog_articles").
			Where("id = ?", articleID).
			Update("indexnow_notified_at", notifiedAt).Error
	})
	if err != nil {
		log.Printf("failed to record IndexNow notification: %v", err)
	}
}

func normalizeIndexNowURLs(urls []string) ([]string, error) {
	urlList := make([]string, 0, len(urls))
	seen := make(map[string]struct{}, len(urls))
	for _, rawURL := range urls {
		parsed, err := url.Parse(strings.TrimSpace(rawURL))
		if err != nil || parsed.Scheme != "https" || parsed.Host != indexNowHost {
			return nil, errors.New("IndexNow URL must use the isirmt.com HTTPS origin")
		}
		if _, ok := seen[parsed.String()]; ok {
			continue
		}

		seen[parsed.String()] = struct{}{}
		urlList = append(urlList, parsed.String())
	}

	return urlList, nil
}
