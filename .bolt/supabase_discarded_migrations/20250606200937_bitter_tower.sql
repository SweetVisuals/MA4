/*
  # Fix RLS and Create Profile Stats Function

  1. New Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
  
  2. Functions
    - Create function to get profile with stats
*/

-- Enable RLS on audio_tracks table
ALTER TABLE audio_tracks ENABLE ROW LEVEL SECURITY;

-- Policies for audio_tracks
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

-- Enable RLS on playlists table
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Policies for playlists
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

-- Enable RLS on playlist_tracks table
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Policies for playlist_tracks
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

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policies for likes
CREATE POLICY "Users can view their own likes"
  ON likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on history table
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Policies for history
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

-- Enable RLS on analytics table
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policies for analytics
CREATE POLICY "Users can view analytics for their content"
  ON analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert analytics for their content"
  ON analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on albums table
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Policies for albums
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

-- Enable RLS on user_wallets table
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Policies for user_wallets
CREATE POLICY "Users can view their own wallet"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

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