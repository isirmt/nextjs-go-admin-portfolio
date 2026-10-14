/* ブログ用タグ */
CREATE TABLE blog_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
);

/* ブログ記事とタグの関連 */
CREATE TABLE blog_article_tags (
    article_id UUID NOT NULL REFERENCES blog_articles (id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES blog_tags (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_blog_article_tags_tag_id
    ON blog_article_tags (tag_id);
