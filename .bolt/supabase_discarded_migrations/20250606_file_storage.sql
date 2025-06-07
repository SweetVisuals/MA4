-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders" 
  ON folders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders" 
  ON folders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
  ON folders FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
  ON folders FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files" 
  ON files FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" 
  ON files FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" 
  ON files FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
  ON files FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for audio files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio_files', 'audio_files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio_files');

CREATE POLICY "User Upload Access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio_files' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "User Delete Access"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio_files' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
