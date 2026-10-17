/* ブログシリーズ */
CREATE TABLE blog_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
);

/* シリーズ内の記事順 */
CREATE TABLE blog_series_articles (
    series_id UUID NOT NULL REFERENCES blog_series (id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES blog_articles (id) ON DELETE CASCADE,
    display_order INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    PRIMARY KEY (series_id, article_id),
    CONSTRAINT chk_blog_series_articles_display_order CHECK (display_order >= 0),
    CONSTRAINT uq_blog_series_articles_series_order UNIQUE (series_id, display_order)
);

CREATE INDEX idx_blog_series_articles_article_id
    ON blog_series_articles (article_id);

CREATE FUNCTION set_blog_series_updated_at ()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW ();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blog_series_updated_at
BEFORE UPDATE ON blog_series
FOR EACH ROW
EXECUTE FUNCTION set_blog_series_updated_at ();
