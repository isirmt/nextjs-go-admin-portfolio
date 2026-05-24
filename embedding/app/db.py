import os

import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.environ["DATABASE_URL"]


def fetch_dirty_works() -> list[dict]:
    query = """
      SELECT
        w.id,
        w.title,
        w.comment,
        w.description,
        ARRAY(
          SELECT ts.name
          FROM isirmt_work_tech_stacks wt
          JOIN common_tech_stacks ts
            ON ts.id = wt.tech_stack_id
          WHERE wt.work_id = w.id
          ORDER BY ts.name
        ) AS tech_stacks
        FROM isirmt_works w
        WHERE w.search_dirty = TRUE
        ORDER BY w.created_at DESC
    """

    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()


def save_search_chunks(
    work_ids: list[str],
    chunks: list[dict],
    embedding_model: str,
) -> None:
    if not work_ids:
        return

    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                  DELETE FROM isirmt_work_search_chunks
                  WHERE work_id = ANY(%s)
                    AND embedding_model = %s                
                  """,
                (work_ids, embedding_model),
            )

            cur.executemany(
                """
                  INSERT INTO isirmt_work_search_chunks (
                      work_id,
                      chunk_kind,
                      content_hash,
                      content,
                      embedding_model,
                      embedding
                  ) VALUES (%s, %s, %s, %s, %s, %s::vector)
                  """,
                [
                    (
                        chunk["work_id"],
                        chunk["chunk_kind"],
                        chunk["content_hash"],
                        chunk["content"],
                        embedding_model,
                        chunk["embedding"],
                    )
                    for chunk in chunks
                ],
            )

            cur.execute(
                """
                  UPDATE isirmt_works
                  SET
                      search_dirty = FALSE,
                      search_indexed_at = NOW(),
                      search_index_error = NULL
                  WHERE id = ANY(%s)
                  """,
                (work_ids,),
            )

        conn.commit()
