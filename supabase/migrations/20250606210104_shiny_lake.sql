/*
  # Update get_profile_with_stats function

  1. Changes
     - Drop existing function first to avoid return type conflict
     - Recreate function with the same functionality

  2. Function Details
     - Returns profile and stats data for a given user ID
     - Combines data into a single JSON response
     - Includes security check for private profiles
*/

-- Drop the existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_profile_with_stats(uuid);

-- Create the function with the desired implementation
CREATE OR REPLACE FUNCTION get_profile_with_stats(profile_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
  stats_data json;
  result json;
BEGIN
  -- Get profile data with column mapping
  SELECT json_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'username', p.username,
    'location', p.location,
    'profile_url', p.profile_url,
    'followers', p.followers,
    'following', p.following,
    'created_at', p.created_at,
    'banner_url', p.banner_url,
    'phone_number', p.phone_number,
    'email', p.email,
    'updated_at', p.updated_at,
    'layout', p.layout,
    'bio', p.bio,
    'social_links', p.social_links,
    'skills', p.skills,
    'profile_type', p.profile_type,
    'is_public', p.is_public,
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
    'privacy_settings', p.privacy_settings
  ) INTO profile_data
  FROM profiles p
  WHERE p.id = profile_id
    AND (p.is_public = true OR p.id = auth.uid());

  -- Get stats data
  SELECT json_build_object(
    'user_id', s.user_id,
    'streams', s.streams,
    'followers', s.followers,
    'gems', s.gems,
    'tracks', s.tracks,
    'playlists', s.playlists,
    'albums', s.albums,
    'created_at', s.created_at,
    'updated_at', s.updated_at
  ) INTO stats_data
  FROM user_stats s
  WHERE s.user_id = profile_id;

  -- Combine results
  result := json_build_object(
    'profile', profile_data,
    'stats', stats_data
  );

  RETURN result;
END;
$$;