/*
  # Add starred column to folders and files tables

  This migration adds a 'starred' column to both the folders and files tables
  to support starring/favoriting functionality. It uses DO blocks with
  IF NOT EXISTS checks to safely add the columns without errors.

  1. Changes
     - Add 'starred' BOOLEAN column with DEFAULT FALSE to folders table
     - Add 'starred' BOOLEAN column with DEFAULT FALSE to files table

  2. Safety
     - Uses IF NOT EXISTS checks to prevent errors if columns already exist
     - Does not recreate tables or policies
     - Does not modify existing data
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