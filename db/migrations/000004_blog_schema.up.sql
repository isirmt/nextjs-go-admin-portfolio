/* ブログ記事 */
CREATE TABLE blog_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    status TEXT NOT NULL DEFAULT 'draft',
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    body_markdown TEXT NOT NULL,
    thumbnail_image_id UUID REFERENCES common_images (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    published_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    CONSTRAINT chk_blog_articles_status CHECK (status IN ('draft', 'published')),
    CONSTRAINT chk_blog_articles_published_at CHECK (
        status <> 'published' OR published_at IS NOT NULL
    )
);

/* 公開済みの記事一覧・詳細取得用 */
CREATE INDEX idx_blog_articles_published_at
    ON blog_articles (published_at DESC)
    WHERE status = 'published';

/* 下書き記事の共有プレビュー用 */
CREATE TABLE blog_article_preview_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    article_id UUID NOT NULL REFERENCES blog_articles (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
);

CREATE INDEX idx_blog_article_preview_links_article_id
    ON blog_article_preview_links (article_id);

/* Markdown本文から抽出して同期する画像参照 */
CREATE TABLE blog_article_images (
    article_id UUID NOT NULL REFERENCES blog_articles (id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES common_images (id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    PRIMARY KEY (article_id, image_id)
);

CREATE INDEX idx_blog_article_images_image_id
    ON blog_article_images (image_id);

CREATE FUNCTION set_blog_article_updated_at ()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW ();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blog_articles_updated_at
BEFORE UPDATE ON blog_articles
FOR EACH ROW
EXECUTE FUNCTION set_blog_article_updated_at ();
