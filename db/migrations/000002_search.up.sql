CREATE EXTENSION IF NOT EXISTS vector;

/* 検索インデックス格納 */
ALTER TABLE isirmt_works
ADD COLUMN IF NOT EXISTS search_dirty BOOLEAN NOT NULL DEFAULT TRUE,
/* 再埋め込み対象 */
ADD COLUMN IF NOT EXISTS search_indexed_at TIMESTAMPTZ,
/* 最終埋め込み日時 */
ADD COLUMN IF NOT EXISTS search_index_error TEXT;

/* 埋め込みエラー内容 */
/* Transformerベースによる埋め込みベクトル格納 */
CREATE TABLE
  IF NOT EXISTS isirmt_work_search_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    work_id UUID NOT NULL REFERENCES isirmt_works (id) ON DELETE CASCADE,
    chunk_kind TEXT NOT NULL,
    /* （例: "title", "comment", "description"） */
    content_hash TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding_model TEXT NOT NULL,
    embedding vector (384) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    CONSTRAINT uq_isirmt_work_search_chunks UNIQUE (work_id, chunk_kind, embedding_model)
  );

CREATE INDEX IF NOT EXISTS idx_isirmt_work_search_chunks_work_id ON isirmt_work_search_chunks (work_id);
