/*
  # Create analytics table and policies

  1. New Tables
    - `analytics` table for tracking user events
      - `id` (uuid, primary key)
      - `event_type` (text)
      - `user_id` (uuid, references auth.users)
      - `track_id` (uuid, references audio_tracks)
      - `data` (jsonb)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `analytics` table
    - Add policies for users to insert and view their own analytics
  3. Performance
    - Add indexes on event_type, user_id, and track_id
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

-- Drop existing policies if they exist to avoid errors
DO $$ 
BEGIN
  -- Drop the insert policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analytics' 
    AND policyname = 'Users can insert analytics for their content'
  ) THEN
    DROP POLICY "Users can insert analytics for their content" ON analytics;
  END IF;
  
  -- Drop the select policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analytics' 
    AND policyname = 'Users can view analytics for their content'
  ) THEN
    DROP POLICY "Users can view analytics for their content" ON analytics;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Users can insert analytics for their content"
  ON analytics
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

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