import asyncio
import logging
import os
from contextlib import asynccontextmanager, suppress
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.embedder import embed_passages, embed_queries
from app.reindex import main as run_reindex

logger = logging.getLogger(__name__)

model_id = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-small")


def get_reindex_interval_seconds() -> int:
    value = os.getenv("REINDEX_INTERVAL_SECONDS", "600")
    try:
        return int(value)
    except ValueError:
        logger.warning("invalid REINDEX_INTERVAL_SECONDS=%r, falling back to 600", value)
        return 600


reindex_interval_seconds = get_reindex_interval_seconds()


async def reindex_periodically() -> None:
    while True:
        try:
            await asyncio.to_thread(run_reindex)
        except Exception:
            logger.exception("failed to reindex search embeddings")

        await asyncio.sleep(reindex_interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task: asyncio.Task[None] | None = None
    if reindex_interval_seconds > 0:
        task = asyncio.create_task(reindex_periodically())

    try:
        yield
    finally:
        if task is not None:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task


app = FastAPI(lifespan=lifespan)


class EmbedRequest(BaseModel):
    texts: list[str] = Field(min_length=1, max_length=32)
    input_type: Literal["query", "passage"]


class EmbedResponse(BaseModel):
    model: str
    dimensions: int
    vectors: list[list[float]]


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {
        "status": "ok",
        "model": model_id,
    }


@app.post("/embed", response_model=EmbedResponse)
def embed(request: EmbedRequest) -> EmbedResponse:
    if request.input_type == "query":
        vectors = embed_queries(request.texts)
    else:
        vectors = embed_passages(request.texts)

    return EmbedResponse(
        model=model_id,
        dimensions=len(vectors[0]),
        vectors=vectors,
    )
