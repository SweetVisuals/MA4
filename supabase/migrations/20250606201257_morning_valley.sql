/*
  # Security Policies and Profile Function

  1. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations on all tables
  2. Functions
    - Create profile with stats function
*/

-- Function to check if a policy exists
CREATE OR REPLACE FUNCTION policy_exists(
  policy_name TEXT,
  table_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE policyname = policy_name
  AND tablename = table_name;
  
  RETURN policy_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on tables
DO $$ 
BEGIN
  -- audio_tracks
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'audio_tracks'
  ) THEN
    RAISE NOTICE 'Table audio_tracks does not exist, skipping';
  ELSE
    ALTER TABLE audio_tracks ENABLE ROW LEVEL SECURITY;
    
    -- Policies for audio_tracks
    IF NOT policy_exists('Users can view public audio tracks', 'audio_tracks') THEN
      CREATE POLICY "Users can view public audio tracks"
        ON audio_tracks FOR SELECT
        USING (is_public = true OR auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can insert their own audio tracks', 'audio_tracks') THEN
      CREATE POLICY "Users can insert their own audio tracks"
        ON audio_tracks FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can update their own audio tracks', 'audio_tracks') THEN
      CREATE POLICY "Users can update their own audio tracks"
        ON audio_tracks FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can delete their own audio tracks', 'audio_tracks') THEN
      CREATE POLICY "Users can delete their own audio tracks"
        ON audio_tracks FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
  END IF;

  -- playlists
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'playlists'
  ) THEN
    RAISE NOTICE 'Table playlists does not exist, skipping';
  ELSE
    ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
    
    -- Policies for playlists
    IF NOT policy_exists('Users can view public playlists', 'playlists') THEN
      CREATE POLICY "Users can view public playlists"
        ON playlists FOR SELECT
        USING (is_public = true OR auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can insert their own playlists', 'playlists') THEN
      CREATE POLICY "Users can insert their own playlists"
        ON playlists FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can update their own playlists', 'playlists') THEN
      CREATE POLICY "Users can update their own playlists"
        ON playlists FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can delete their own playlists', 'playlists') THEN
      CREATE POLICY "Users can delete their own playlists"
        ON playlists FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
  END IF;

  -- playlist_tracks
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'playlist_tracks'
  ) THEN
    RAISE NOTICE 'Table playlist_tracks does not exist, skipping';
  ELSE
    ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
    
    -- Policies for playlist_tracks
    IF NOT policy_exists('Users can view playlist tracks for playlists they can access', 'playlist_tracks') THEN
      CREATE POLICY "Users can view playlist tracks for playlists they can access"
        ON playlist_tracks FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND (playlists.is_public = true OR playlists.user_id = auth.uid())
          )
        );
    END IF;
    
    IF NOT policy_exists('Users can insert tracks to their own playlists', 'playlist_tracks') THEN
      CREATE POLICY "Users can insert tracks to their own playlists"
        ON playlist_tracks FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT policy_exists('Users can update tracks in their own playlists', 'playlist_tracks') THEN
      CREATE POLICY "Users can update tracks in their own playlists"
        ON playlist_tracks FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT policy_exists('Users can delete tracks from their own playlists', 'playlist_tracks') THEN
      CREATE POLICY "Users can delete tracks from their own playlists"
        ON playlist_tracks FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.user_id = auth.uid()
          )
        );
    END IF;
  END IF;

  -- likes
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'likes'
  ) THEN
    RAISE NOTICE 'Table likes does not exist, skipping';
  ELSE
    ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
    
    -- Policies for likes
    IF NOT policy_exists('Users can view their own likes', 'likes') THEN
      CREATE POLICY "Users can view their own likes"
        ON likes FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can insert their own likes', 'likes') THEN
      CREATE POLICY "Users can insert their own likes"
        ON likes FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can delete their own likes', 'likes') THEN
      CREATE POLICY "Users can delete their own likes"
        ON likes FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
  END IF;

  -- history
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'history'
  ) THEN
    RAISE NOTICE 'Table history does not exist, skipping';
  ELSE
    ALTER TABLE history ENABLE ROW LEVEL SECURITY;
    
    -- Policies for history
    IF NOT policy_exists('Users can view their own history', 'history') THEN
      CREATE POLICY "Users can view their own history"
        ON history FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can insert into their own history', 'history') THEN
      CREATE POLICY "Users can insert into their own history"
        ON history FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can update their own history', 'history') THEN
      CREATE POLICY "Users can update their own history"
        ON history FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can delete their own history', 'history') THEN
      CREATE POLICY "Users can delete their own history"
        ON history FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
  END IF;

  -- analytics
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'analytics'
  ) THEN
    RAISE NOTICE 'Table analytics does not exist, skipping';
  ELSE
    ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
    
    -- Policies for analytics
    IF NOT policy_exists('Users can view analytics for their content', 'analytics') THEN
      CREATE POLICY "Users can view analytics for their content"
        ON analytics FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can insert analytics for their content', 'analytics') THEN
      CREATE POLICY "Users can insert analytics for their content"
        ON analytics FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
  END IF;

  -- albums
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'albums'
  ) THEN
    RAISE NOTICE 'Table albums does not exist, skipping';
  ELSE
    ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
    
    -- Policies for albums
    IF NOT policy_exists('Users can view public albums', 'albums') THEN
      CREATE POLICY "Users can view public albums"
        ON albums FOR SELECT
        USING (is_public = true OR auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can insert their own albums', 'albums') THEN
      CREATE POLICY "Users can insert their own albums"
        ON albums FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can update their own albums', 'albums') THEN
      CREATE POLICY "Users can update their own albums"
        ON albums FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can delete their own albums', 'albums') THEN
      CREATE POLICY "Users can delete their own albums"
        ON albums FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
  END IF;

  -- user_wallets
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'user_wallets'
  ) THEN
    RAISE NOTICE 'Table user_wallets does not exist, skipping';
  ELSE
    ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
    
    -- Policies for user_wallets
    IF NOT policy_exists('Users can view their own wallet', 'user_wallets') THEN
      CREATE POLICY "Users can view their own wallet"
        ON user_wallets FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT policy_exists('Users can update their own wallet', 'user_wallets') THEN
      CREATE POLICY "Users can update their own wallet"
        ON user_wallets FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- First drop the existing function if it exists
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

-- Drop the helper function as it's no longer needed
DROP FUNCTION IF EXISTS policy_exists(TEXT, TEXT);