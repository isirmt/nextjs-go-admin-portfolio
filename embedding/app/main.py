import os

from fastapi import FastAPI

app = FastAPI()

model_id = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-small")


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {
        "status": "ok",
        "model": model_id,
    }
