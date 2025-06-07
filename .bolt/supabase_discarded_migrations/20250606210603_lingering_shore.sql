/*
  # Fix Analytics Migration

  1. Changes
     - Add IF NOT EXISTS to policy creation statements
     - Keep all other functionality the same
  2. Security
     - Maintains existing RLS policies
     - Preserves all indexes
*/

-- Create analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  track_id uuid REFERENCES audio_tracks(id) ON DELETE SET NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies with IF NOT EXISTS to prevent errors
CREATE POLICY IF NOT EXISTS "Users can insert analytics for their content"
  ON analytics
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Create policy for viewing analytics with IF NOT EXISTS
CREATE POLICY IF NOT EXISTS "Users can view analytics for their content"
  ON analytics
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create index on event_type for faster queries
CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics (event_type);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS analytics_user_id_idx ON analytics (user_id);

-- Create index on track_id for faster queries
CREATE INDEX IF NOT EXISTS analytics_track_id_idx ON analytics (track_id);