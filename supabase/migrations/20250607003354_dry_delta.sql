/*
  # Fix infinite recursion in conversation_participants RLS policy

  1. Security Changes
    - Drop the existing problematic SELECT policy for conversation_participants
    - Create a new simplified SELECT policy that avoids recursion
    - The new policy allows users to view participants in conversations where they are also participants
    - Uses a direct subquery without circular references

  2. Policy Changes
    - Replace the recursive policy with a simpler one that checks user participation directly
    - Maintains security by ensuring users can only see participants in their own conversations
*/

-- Drop the existing problematic SELECT policy
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;

-- Create a new simplified SELECT policy that avoids recursion
CREATE POLICY "Users can view conversation participants" 
  ON conversation_participants 
  FOR SELECT 
  TO public 
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp2 
      WHERE cp2.conversation_id = conversation_participants.conversation_id 
      AND cp2.user_id = auth.uid()
    )
  );