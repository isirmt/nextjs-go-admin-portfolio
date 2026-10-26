CREATE OR REPLACE FUNCTION set_blog_article_updated_at ()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF current_setting('isirmt.skip_blog_article_updated_at', true) = 'true' THEN
        RETURN NEW;
    END IF;

    NEW.updated_at = NOW ();
    RETURN NEW;
END;
$$;
