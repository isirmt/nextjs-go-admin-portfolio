DROP TABLE IF EXISTS blog_search_chunks;
ALTER TABLE blog_articles DROP COLUMN IF EXISTS search_indexed_at;
