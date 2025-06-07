/*
  # Add starred columns to files and folders tables

  1. Changes
    - Add starred column to folders table if it doesn't exist
    - Add starred column to files table if it doesn't exist
  
  2. Security
    - No changes to RLS policies
*/

-- Add starred column to folders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'folders' AND column_name = 'starred'
  ) THEN
    ALTER TABLE folders ADD COLUMN starred BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add starred column to files table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'starred'
  ) THEN
    ALTER TABLE files ADD COLUMN starred BOOLEAN DEFAULT FALSE;
  END IF;
END $$;