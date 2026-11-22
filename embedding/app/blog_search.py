import re
import time
from dataclasses import dataclass

from markdown_it import MarkdownIt
from markdown_it.token import Token

from app.db import fetch_dirty_blogs, save_blog_search_chunks
from app.embedder import MODEL_ID, embed_passages, get_model

MAX_TOKENS = 256
MARKDOWN_PARSER = MarkdownIt("commonmark").enable(["table", "strikethrough"])


@dataclass(frozen=True)
class BlogChunk:
    heading: str
    content: str
    display_content: str


def plain_text(tokens: list[Token]) -> str:
    parts: list[str] = []
    for token in tokens:
        if token.type in {"text", "code_inline"}:
            parts.append(token.content)
        elif token.type in {"softbreak", "hardbreak"}:
            parts.append(" ")
    return " ".join("".join(parts).split())


def sections(markdown: str) -> list[tuple[str, list[str]]]:
    result: list[tuple[str, list[str]]] = []
    heading = "本文"
    paragraphs: list[str] = []

    def flush_section() -> None:
        if paragraphs:
            result.append((heading, paragraphs.copy()))
            paragraphs.clear()

    tokens = MARKDOWN_PARSER.parse(markdown)
    for index, token in enumerate(tokens):
        if token.type == "heading_open" and token.tag in {"h2", "h3"}:
            flush_section()
            next_token = tokens[index + 1]
            heading = plain_text(next_token.children or []) or "本文"
        elif token.type == "paragraph_open":
            next_token = tokens[index + 1]
            value = plain_text(next_token.children or [])
            if value:
                paragraphs.append(value)
        elif token.type == "inline" and index > 0 and tokens[index - 1].type in {
            "th_open",
            "td_open",
        }:
            value = plain_text(token.children or [])
            if value:
                paragraphs.append(value)
    flush_section()
    return result


def build_blog_chunks(title: str, markdown: str) -> list[BlogChunk]:
    tokenizer = get_model().tokenizer

    def token_count(value: str) -> int:
        return len(tokenizer.encode(f"passage: {value}", add_special_tokens=True))

    def longest_fitting_prefix(value: str, prefix: str, limit: int) -> str:
        if token_count(prefix + value) <= limit:
            return value
        lower, upper = 0, len(value)
        while lower < upper:
            middle = (lower + upper + 1) // 2
            if token_count(prefix + value[:middle]) <= limit:
                lower = middle
            else:
                upper = middle - 1
        return value[:lower]

    title_for_search = longest_fitting_prefix(title, "", MAX_TOKENS)
    context_title = longest_fitting_prefix(title, "", 64)
    chunks = [BlogChunk("タイトル", title_for_search, title)]
    for heading, paragraphs in sections(markdown):
        context_heading = longest_fitting_prefix(heading, "", 64)
        prefix = f"{context_title} / {context_heading}: "
        current = ""

        def append_fitting(value: str) -> None:
            nonlocal current
            candidate = f"{current} {value}".strip()
            if token_count(prefix + candidate) <= MAX_TOKENS:
                current = candidate
            else:
                chunks.append(BlogChunk(heading, prefix + current, current))
                current = value

        def append_text(value: str) -> None:
            nonlocal current
            candidate = f"{current} {value}".strip()
            if token_count(prefix + candidate) <= MAX_TOKENS:
                current = candidate
                return
            if current:
                chunks.append(BlogChunk(heading, prefix + current, current))
                current = ""
            if token_count(prefix + value) <= MAX_TOKENS:
                current = value
                return
            for sentence in re.split(r"(?<=[。！？.!?])\s*", value):
                if not sentence:
                    continue
                if token_count(prefix + sentence) <= MAX_TOKENS:
                    append_fitting(sentence)
                    continue
                remaining = sentence
                while remaining:
                    piece = longest_fitting_prefix(remaining, prefix, MAX_TOKENS)
                    if not piece:
                        raise ValueError("blog search prefix leaves no room for content")
                    append_fitting(piece)
                    remaining = remaining[len(piece) :].lstrip()

        for paragraph in paragraphs:
            append_text(paragraph)
        if current:
            chunks.append(BlogChunk(heading, prefix + current, current))
    return chunks


def reindex_blogs() -> None:
    while articles := fetch_dirty_blogs(limit=3):
        for article in articles:
            chunks = build_blog_chunks(article["title"], article["body_markdown"])
            rows = []
            for index in range(0, len(chunks), 16):
                batch = chunks[index : index + 16]
                vectors = embed_passages([chunk.content for chunk in batch])
                rows.extend(
                    {
                        "chunk_index": index + offset,
                        "heading": chunk.heading,
                        "content": chunk.content,
                        "display_content": chunk.display_content,
                        "embedding": vector,
                    }
                    for offset, (chunk, vector) in enumerate(zip(batch, vectors, strict=True))
                )
            save_blog_search_chunks(article["id"], rows, MODEL_ID)
        if len(articles) == 3:
            time.sleep(2)
