ALTER TABLE blog_articles
ADD COLUMN indexnow_notified_at TIMESTAMPTZ;

SET LOCAL isirmt.skip_blog_article_updated_at = 'true';

UPDATE blog_articles
SET indexnow_notified_at = NOW()
WHERE status = 'published'
  AND published_at <= NOW();
