import os
from functools import lru_cache

from sentence_transformers import SentenceTransformer

MODEL_ID = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-small")


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_ID)


def embed_queries(texts: list[str]) -> list[list[float]]:
    model = get_model()
    inputs = [f"query: {text}" for text in texts]
    vectors = model.encode(
        inputs,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return vectors.tolist()


def embed_passages(texts: list[str]) -> list[list[float]]:
    model = get_model()
    inputs = [f"passage: {text}" for text in texts]
    vectors = model.encode(
        inputs,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return vectors.tolist()
