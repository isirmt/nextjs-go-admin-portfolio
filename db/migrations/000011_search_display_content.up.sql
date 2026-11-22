ALTER TABLE isirmt_work_search_chunks ADD COLUMN display_content TEXT;
ALTER TABLE blog_search_chunks ADD COLUMN display_content TEXT;

UPDATE isirmt_work_search_chunks AS chunks
SET display_content = CASE chunks.chunk_kind
  WHEN 'summary' THEN COALESCE(NULLIF(TRIM(works.comment), ''), works.title)
  WHEN 'description' THEN COALESCE(works.description, chunks.content)
  WHEN 'tech_stacks' THEN REGEXP_REPLACE(chunks.content, '^使用技術: ', '')
  ELSE chunks.content
END
FROM isirmt_works AS works
WHERE works.id = chunks.work_id;

UPDATE blog_search_chunks AS chunks
SET display_content = CASE
  WHEN chunks.heading = 'タイトル' THEN articles.title
  WHEN LEFT(chunks.content, LENGTH(articles.title || ' / ' || chunks.heading || ': ')) =
       articles.title || ' / ' || chunks.heading || ': '
    THEN SUBSTRING(chunks.content FROM LENGTH(articles.title || ' / ' || chunks.heading || ': ') + 1)
  ELSE chunks.content
END
FROM blog_articles AS articles
WHERE articles.id = chunks.article_id;

ALTER TABLE isirmt_work_search_chunks ALTER COLUMN display_content SET NOT NULL;
ALTER TABLE blog_search_chunks ALTER COLUMN display_content SET NOT NULL;
