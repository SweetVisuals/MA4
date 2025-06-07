/*
  # Create services table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `type` (text, not null)
      - `description` (text, not null)
      - `price` (numeric, nullable)
      - `delivery_time` (text, nullable)
      - `revisions` (integer, nullable)
      - `is_featured` (boolean, default false)
      - `is_active` (boolean, default true)
      - `user_id` (uuid, not null, references profiles)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `services` table
    - Add policies for CRUD operations
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  price numeric(12,2),
  delivery_time text,
  revisions integer,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_services_updated_at();

-- Create policies
-- Users can view their own services and public services
CREATE POLICY "Users can view their own services"
  ON services
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Users can insert their own services
CREATE POLICY "Users can insert their own services"
  ON services
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own services
CREATE POLICY "Users can update their own services"
  ON services
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own services
CREATE POLICY "Users can delete their own services"
  ON services
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS services_user_id_idx ON services (user_id);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS services_type_idx ON services (type);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS services_is_active_idx ON services (is_active);