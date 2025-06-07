/*
  # Fix RLS policies and create profile function

  1. New Tables
    - No new tables created
  2. Security
    - Enable RLS on all tables
    - Add proper policies for each table
  3. Functions
    - Create get_profile_with_stats function
*/

-- Enable RLS on audio_tracks table
DO $$ 
BEGIN
  -- Check if RLS is already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'audio_tracks' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE audio_tracks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view public audio tracks" ON audio_tracks;
  DROP POLICY IF EXISTS "Users can insert their own audio tracks" ON audio_tracks;
  DROP POLICY IF EXISTS "Users can update their own audio tracks" ON audio_tracks;
  DROP POLICY IF EXISTS "Users can delete their own audio tracks" ON audio_tracks;
  
  -- Create new policies
  CREATE POLICY "Users can view public audio tracks"
    ON audio_tracks FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own audio tracks"
    ON audio_tracks FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own audio tracks"
    ON audio_tracks FOR UPDATE
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own audio tracks"
    ON audio_tracks FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Enable RLS on playlists table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'playlists' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view public playlists" ON playlists;
  DROP POLICY IF EXISTS "Users can insert their own playlists" ON playlists;
  DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
  DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;
  
  CREATE POLICY "Users can view public playlists"
    ON playlists FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own playlists"
    ON playlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own playlists"
    ON playlists FOR UPDATE
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own playlists"
    ON playlists FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Enable RLS on playlist_tracks table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'playlist_tracks' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view playlist tracks for playlists they can access" ON playlist_tracks;
  DROP POLICY IF EXISTS "Users can insert tracks to their own playlists" ON playlist_tracks;
  DROP POLICY IF EXISTS "Users can update tracks in their own playlists" ON playlist_tracks;
  DROP POLICY IF EXISTS "Users can delete tracks from their own playlists" ON playlist_tracks;
  
  CREATE POLICY "Users can view playlist tracks for playlists they can access"
    ON playlist_tracks FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM playlists 
        WHERE playlists.id = playlist_tracks.playlist_id 
        AND (playlists.is_public = true OR playlists.user_id = auth.uid())
      )
    );
  
  CREATE POLICY "Users can insert tracks to their own playlists"
    ON playlist_tracks FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM playlists 
        WHERE playlists.id = playlist_tracks.playlist_id 
        AND playlists.user_id = auth.uid()
      )
    );
  
  CREATE POLICY "Users can update tracks in their own playlists"
    ON playlist_tracks FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM playlists 
        WHERE playlists.id = playlist_tracks.playlist_id 
        AND playlists.user_id = auth.uid()
      )
    );
  
  CREATE POLICY "Users can delete tracks from their own playlists"
    ON playlist_tracks FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM playlists 
        WHERE playlists.id = playlist_tracks.playlist_id 
        AND playlists.user_id = auth.uid()
      )
    );
END $$;

-- Enable RLS on likes table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'likes' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
  DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
  DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
  
  CREATE POLICY "Users can view their own likes"
    ON likes FOR SELECT
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own likes"
    ON likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own likes"
    ON likes FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Enable RLS on history table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'history' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE history ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own history" ON history;
  DROP POLICY IF EXISTS "Users can insert into their own history" ON history;
  DROP POLICY IF EXISTS "Users can update their own history" ON history;
  DROP POLICY IF EXISTS "Users can delete their own history" ON history;
  
  CREATE POLICY "Users can view their own history"
    ON history FOR SELECT
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert into their own history"
    ON history FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own history"
    ON history FOR UPDATE
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own history"
    ON history FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Enable RLS on analytics table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'analytics' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view analytics for their content" ON analytics;
  DROP POLICY IF EXISTS "Users can insert analytics for their content" ON analytics;
  
  CREATE POLICY "Users can view analytics for their content"
    ON analytics FOR SELECT
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert analytics for their content"
    ON analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Enable RLS on albums table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'albums' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view public albums" ON albums;
  DROP POLICY IF EXISTS "Users can insert their own albums" ON albums;
  DROP POLICY IF EXISTS "Users can update their own albums" ON albums;
  DROP POLICY IF EXISTS "Users can delete their own albums" ON albums;
  
  CREATE POLICY "Users can view public albums"
    ON albums FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own albums"
    ON albums FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own albums"
    ON albums FOR UPDATE
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own albums"
    ON albums FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Enable RLS on user_wallets table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_wallets' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own wallet" ON user_wallets;
  DROP POLICY IF EXISTS "Users can update their own wallet" ON user_wallets;
  
  CREATE POLICY "Users can view their own wallet"
    ON user_wallets FOR SELECT
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own wallet"
    ON user_wallets FOR UPDATE
    USING (auth.uid() = user_id);
END $$;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_profile_with_stats(UUID);

-- Create function to get profile with stats
CREATE FUNCTION get_profile_with_stats(profile_id UUID)
RETURNS JSON AS $$
DECLARE
    profile_data JSON;
    stats_data JSON;
    result JSON;
BEGIN
    -- Get profile data
    SELECT json_build_object(
        'id', p.id,
        'username', p.username,
        'full_name', p.full_name,
        'location', p.location,
        'profile_url', p.profile_url,
        'banner_url', p.banner_url,
        'bio', p.bio,
        'website_url', p.website_url,
        'professional_title', p.professional_title,
        'genres', p.genres,
        'instruments', p.instruments,
        'years_of_experience', p.years_of_experience,
        'rates', p.rates,
        'availability', p.availability,
        'accent_color', p.accent_color,
        'theme', p.theme,
        'display_layout', p.display_layout,
        'privacy_settings', p.privacy_settings,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    )
    INTO profile_data
    FROM profiles p
    WHERE p.id = profile_id;

    -- Get stats data
    SELECT json_build_object(
        'user_id', s.user_id,
        'streams', s.streams,
        'followers', s.followers,
        'gems', s.gems,
        'tracks', s.tracks,
        'playlists', s.playlists,
        'albums', s.albums
    )
    INTO stats_data
    FROM user_stats s
    WHERE s.user_id = profile_id;

    -- Combine into result
    result := json_build_object(
        'profile', profile_data,
        'stats', stats_data
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;