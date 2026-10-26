CREATE OR REPLACE FUNCTION set_blog_article_updated_at ()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW ();
    RETURN NEW;
END;
$$;
