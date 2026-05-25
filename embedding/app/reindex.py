import json
import hashlib
from dataclasses import asdict, dataclass
from typing import Any

from app.db import fetch_dirty_works, save_search_chunks
from app.embedder import MODEL_ID, embed_passages


@dataclass(frozen=True)
class SearchChunk:
    work_id: str
    chunk_kind: str
    content: str
    content_hash: str


def normalize_text(text: str) -> str:
    return " ".join(text.split())


def hash_content(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def make_chunk(work_id: str, chunk_kind: str, content: str) -> SearchChunk | None:
    normalized = normalize_text(content)
    if not normalized:
        return None

    return SearchChunk(
        work_id=work_id,
        chunk_kind=chunk_kind,
        content=normalized,
        content_hash=hash_content(normalized),
    )


def build_chunks(work: dict[str, Any]) -> list[SearchChunk]:
    work_id = str(work["id"])
    chunks: list[SearchChunk] = []

    summary = make_chunk(
        work_id,
        "summary",
        f"タイトル: {work['title']}。 概要: {work['comment']}。",
    )
    if summary:
        chunks.append(summary)

    description = make_chunk(
        work_id,
        "description",
        work.get("description") or "",
    )
    if description:
        chunks.append(description)

    tech_stacks = work.get("tech_stacks") or []
    tech_content = "、".join(tech_stacks)
    tech_chunk = make_chunk(
        work_id,
        "tech_stacks",
        f"使用技術: {tech_content}。",
    )
    if tech_chunk:
        chunks.append(tech_chunk)

    return chunks


def main() -> None:
    works = fetch_dirty_works()
    chunks = [chunk for work in works for chunk in build_chunks(work)]

    print(f"dirty works: {len(works)}")
    print(f"chunks: {len(chunks)}")

    if not chunks:
        return

    vectors = embed_passages([chunk.content for chunk in chunks])
    rows = [
        {
            **asdict(chunk),
            "embedding": vector,
        }
        for chunk, vector in zip(chunks, vectors, strict=True)
    ]

    work_ids = sorted({str(work["id"]) for work in works})
    save_search_chunks(work_ids, rows, MODEL_ID)

    print(f"saved chunks: {len(rows)}")


if __name__ == "__main__":
    main()
