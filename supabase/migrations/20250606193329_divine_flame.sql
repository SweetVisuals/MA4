/*
  # Add starred column to folders and files tables
  
  1. Changes
     - Add 'starred' column to folders table
     - Add 'starred' column to files table
  
  2. Notes
     - Uses DO blocks with IF NOT EXISTS checks to prevent errors if columns already exist
     - Avoids recreating tables and policies that already exist
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