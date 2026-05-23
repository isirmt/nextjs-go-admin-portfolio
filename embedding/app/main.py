import os
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.embedder import embed_passages, embed_queries

app = FastAPI()

model_id = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-small")


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
