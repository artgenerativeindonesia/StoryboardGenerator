-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROJECTS
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- FILES
CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  original_name   TEXT NOT NULL,
  size_bytes      BIGINT NOT NULL,
  mime_type       TEXT NOT NULL DEFAULT 'application/pdf',
  storage_path    TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_files_project_id ON files(project_id);

-- SESSION STATUS ENUM
CREATE TYPE session_status AS ENUM (
  'draft', 'generating_script', 'script_ready',
  'generating_shotlist', 'shotlist_ready',
  'generating_images', 'complete', 'error'
);

-- GENERATION SESSIONS
CREATE TABLE generation_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL DEFAULT 'New Session',
  status              session_status NOT NULL DEFAULT 'draft',
  instructions        TEXT,
  selected_file_ids   UUID[] NOT NULL DEFAULT '{}',
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_project_id ON generation_sessions(project_id);

-- SCRIPTS
CREATE TABLE scripts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL UNIQUE REFERENCES generation_sessions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  content_html    TEXT,
  llm_model       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SHOTLIST ROWS
CREATE TABLE shotlist_rows (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES generation_sessions(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scene_number      TEXT NOT NULL,
  shot_number       TEXT NOT NULL,
  composition       TEXT,
  shot_type         TEXT,
  shot_angle        TEXT,
  view_level        TEXT,
  lens_properties   TEXT,
  style             TEXT,
  mood              TEXT,
  scene_description TEXT,
  image_prompt      TEXT,
  row_order         INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shotlist_session_id ON shotlist_rows(session_id);
CREATE INDEX idx_shotlist_order ON shotlist_rows(session_id, row_order);

-- IMAGE STATUS ENUM
CREATE TYPE image_status AS ENUM ('pending', 'generating', 'complete', 'error');

-- GENERATED IMAGES
CREATE TABLE generated_images (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES generation_sessions(id) ON DELETE CASCADE,
  shotlist_row_id UUID NOT NULL REFERENCES shotlist_rows(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          image_status NOT NULL DEFAULT 'pending',
  image_prompt    TEXT NOT NULL,
  storage_path    TEXT,
  provider        TEXT,
  provider_job_id TEXT,
  error_message   TEXT,
  generation      INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_images_session_id ON generated_images(session_id);
CREATE INDEX idx_images_shotlist_row ON generated_images(shotlist_row_id);

-- USER SETTINGS
CREATE TABLE user_settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  openrouter_api_key    TEXT,
  openrouter_model      TEXT NOT NULL DEFAULT 'openai/gpt-4o',
  image_provider        TEXT NOT NULL DEFAULT 'higgsfield',
  higgsfield_api_key    TEXT,
  higgsfield_model      TEXT,
  kieai_api_key         TEXT,
  kieai_model           TEXT,
  wavespeed_api_key     TEXT,
  wavespeed_model       TEXT,
  use_higgsfield_mcp    BOOLEAN NOT NULL DEFAULT FALSE,
  ui_projects_view      TEXT NOT NULL DEFAULT 'grid',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_sessions_updated_at BEFORE UPDATE ON generation_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_scripts_updated_at BEFORE UPDATE ON scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_shotlist_updated_at BEFORE UPDATE ON shotlist_rows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_images_updated_at BEFORE UPDATE ON generated_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shotlist_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own projects" ON projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own files" ON files FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own sessions" ON generation_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own scripts" ON scripts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own shotlist rows" ON shotlist_rows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own generated images" ON generated_images FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own settings" ON user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
