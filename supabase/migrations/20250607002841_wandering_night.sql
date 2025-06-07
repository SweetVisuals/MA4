/*
  # Create project organization tables

  1. New Tables
    - `projects` - Stores project metadata (beat tapes, sound packs, etc.)
    - `project_files` - Links files to projects
    - `project_pricing` - Stores pricing information for projects and files
    - `licenses` - Stores license types and details

  2. Security
    - Enable RLS on all tables
    - Add policies for project management
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL, -- 'beat_tape', 'sound_pack', 'album', 'single'
  genre text,
  bpm integer,
  key text,
  tags text[],
  cover_art_url text,
  is_public boolean DEFAULT false,
  order_id uuid, -- Reference to an order if this is a submission
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_id uuid REFERENCES files(id) ON DELETE CASCADE,
  position integer NOT NULL,
  PRIMARY KEY (project_id, file_id)
);

-- Create project_pricing table
CREATE TABLE IF NOT EXISTS project_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_id uuid REFERENCES files(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL,
  license_type text, -- 'basic', 'premium', 'exclusive', null for project price
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT project_or_file_required CHECK (
    (project_id IS NOT NULL AND file_id IS NULL) OR
    (project_id IS NOT NULL AND file_id IS NOT NULL)
  )
);

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  terms text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view public projects"
  ON projects
  FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  USING (user_id = auth.uid());

-- Create policies for project_files
CREATE POLICY "Users can view project files for projects they can access"
  ON project_files
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE is_public = true OR user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert project files for their projects"
  ON project_files
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project files for their projects"
  ON project_files
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete project files for their projects"
  ON project_files
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for project_pricing
CREATE POLICY "Users can view pricing for projects they can access"
  ON project_pricing
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE is_public = true OR user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pricing for their projects"
  ON project_pricing
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pricing for their projects"
  ON project_pricing
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pricing for their projects"
  ON project_pricing
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for licenses
CREATE POLICY "Users can view licenses"
  ON licenses
  FOR SELECT
  USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "Users can insert their own licenses"
  ON licenses
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own licenses"
  ON licenses
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own licenses"
  ON licenses
  FOR DELETE
  USING (user_id = auth.uid());

-- Create triggers to update updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_pricing_updated_at
BEFORE UPDATE ON project_pricing
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
BEFORE UPDATE ON licenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();