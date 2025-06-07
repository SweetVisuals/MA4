/*
  # Add analytics table for gem events

  1. New Table
    - Create analytics table if it doesn't exist yet
    - This table will track various events including gem giving
  
  2. Security
    - Enable RLS on analytics table
    - Add policies for insert and select
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

-- Enable Row Level Security
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can insert analytics for their content
CREATE POLICY "Users can insert analytics for their content"
  ON analytics
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Users can view analytics for their content
CREATE POLICY "Users can view analytics for their content"
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