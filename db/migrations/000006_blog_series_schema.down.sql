DROP TRIGGER IF EXISTS trg_blog_series_updated_at ON blog_series;
DROP FUNCTION IF EXISTS set_blog_series_updated_at ();

DROP TABLE IF EXISTS blog_series_articles;
DROP TABLE IF EXISTS blog_series;
