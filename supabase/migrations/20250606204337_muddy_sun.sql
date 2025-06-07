/*
  # Fix get_profile_with_stats function

  1. Database Function Fix
    - Update the `get_profile_with_stats` function to use correct column names
    - Change 'name' to 'full_name' to match the actual schema
    - Ensure the function returns the correct structure

  2. Function Definition
    - Returns profile data with stats
    - Uses correct column names from profiles table
    - Maintains compatibility with existing code
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_profile_with_stats(uuid);

-- Create the corrected function
CREATE OR REPLACE FUNCTION get_profile_with_stats(profile_id uuid)
RETURNS TABLE (
  profile jsonb,
  stats jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(p.*) as profile,
    to_jsonb(s.*) as stats
  FROM profiles p
  LEFT JOIN user_stats s ON p.id = s.user_id
  WHERE p.id = profile_id;
END;
$$;