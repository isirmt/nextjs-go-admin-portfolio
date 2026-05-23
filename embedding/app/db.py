import os

import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.environ["DATABASE_URL"]


def fetch_dirty_works() -> list[dict]:
    query = """
      SELECT
        w.id,
        w.title,
        w,comment,
        w.description,
        AARRAY(
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
