DROP TABLE IF EXISTS isirmt_work_search_chunks;

ALTER TABLE isirmt_works
DROP COLUMN IF EXISTS search_index_error,
DROP COLUMN IF EXISTS search_indexed_at,
DROP COLUMN IF EXISTS search_dirty;

DROP EXTENSION IF EXISTS vector;
