DROP TRIGGER IF EXISTS trg_blog_articles_updated_at ON blog_articles;
DROP FUNCTION IF EXISTS set_blog_article_updated_at ();

DROP TABLE IF EXISTS blog_article_images;
DROP TABLE IF EXISTS blog_article_preview_links;
DROP TABLE IF EXISTS blog_articles;
