package main

import (
	"context"
	"errors"
	"realtime/internal/query/model"

	"gorm.io/gorm"
)

func backfillBlogArticleExcerpts(ctx context.Context, db *gorm.DB) (int64, error) {
	articles := make([]model.BlogArticle, 0)
	if err := db.WithContext(ctx).
		Select("id", "body_markdown").
		Where("excerpt = ''").
		Find(&articles).Error; err != nil {
		return 0, err
	}

	var updatedCount int64
	err := db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("SELECT set_config('isirmt.skip_blog_article_updated_at', 'true', true)").Error; err != nil {
			return err
		}

		for _, article := range articles {
			if article.ID == nil {
				return errors.New("blog article id is missing")
			}
			result := tx.Exec(
				"UPDATE blog_articles SET excerpt = ? WHERE id = ? AND excerpt = ''",
				generateBlogExcerpt(article.BodyMarkdown),
				*article.ID,
			)
			if result.Error != nil {
				return result.Error
			}
			updatedCount += result.RowsAffected
		}
		return nil
	})
	return updatedCount, err
}
