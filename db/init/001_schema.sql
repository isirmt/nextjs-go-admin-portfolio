CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* 共通利用可能な画像格納(ローカル配置) */
CREATE TABLE
    IF NOT EXISTS common_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

/* 共通技術スタック情報格納 */
CREATE TABLE
    IF NOT EXISTS common_tech_stacks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name TEXT NOT NULL,
        logo_image_id UUID REFERENCES common_images (id) ON DELETE SET NULL
    );

/* 作品格納 */
CREATE TABLE
    IF NOT EXISTS isirmt_works (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        accent_color CHAR(7) NOT NULL DEFAULT '#000000',
        description TEXT,
        thumbnail_image_id UUID REFERENCES common_images (id) ON DELETE SET NULL
    );

/* 作品の関連画像格納 */
CREATE TABLE
    IF NOT EXISTS isirmt_work_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        work_id UUID NOT NULL REFERENCES isirmt_works (id) ON DELETE CASCADE,
        image_id UUID NOT NULL REFERENCES common_images (id) ON DELETE CASCADE,
        display_order INT NOT NULL,
        CHECK (display_order >= 0),
        CONSTRAINT uq_isirmt_work_images_work_order UNIQUE (work_id, display_order)
    );

/* 作品と技術スタックの関連付け情報格納 */
CREATE TABLE
    IF NOT EXISTS isirmt_work_tech_stacks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        work_id UUID NOT NULL REFERENCES isirmt_works (id) ON DELETE CASCADE,
        tech_stack_id UUID NOT NULL REFERENCES common_tech_stacks (id) ON DELETE CASCADE
    );

/* 作品のクリック数情報格納 */
CREATE TABLE
    IF NOT EXISTS isirmt_work_clicks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        work_id UUID NOT NULL REFERENCES isirmt_works (id) ON DELETE CASCADE,
        clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE INDEX IF NOT EXISTS idx_isirmt_work_clicks_work_id ON isirmt_work_clicks (work_id);

CREATE INDEX IF NOT EXISTS idx_isirmt_work_clicks_clicked_at ON isirmt_work_clicks (clicked_at);