ALTER TABLE blog_articles
  ADD COLUMN search_indexed_at TIMESTAMPTZ;

CREATE TABLE blog_search_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  heading TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding_model TEXT NOT NULL,
  embedding vector(384) NOT NULL,
  CONSTRAINT uq_blog_search_chunk UNIQUE (article_id, chunk_index, embedding_model)
);

CREATE INDEX idx_blog_search_chunks_article_id ON blog_search_chunks(article_id);
