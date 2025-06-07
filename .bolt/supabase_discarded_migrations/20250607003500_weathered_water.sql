/*
  # Fix infinite recursion in conversation participants RLS policies

  1. Security Updates
    - Drop existing problematic policies on conversation_participants
    - Create simplified, non-recursive policies
    - Ensure policies don't create circular references
    - Update related table policies for consistency

  2. Policy Changes
    - conversation_participants: Simple user-based access control
    - conversations: Access based on participation
    - messages: Access based on conversation participation
    - message_attachments: Access based on message ownership

  3. Notes
    - Removes complex subqueries that cause recursion
    - Uses direct user ID comparisons where possible
    - Maintains security while eliminating circular dependencies
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;

-- Drop and recreate conversations policies to ensure consistency
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;

-- Drop and recreate message policies to ensure consistency
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Drop and recreate message attachment policies
DROP POLICY IF EXISTS "Users can view message attachments in their conversations" ON message_attachments;
DROP POLICY IF EXISTS "Users can insert message attachments for their messages" ON message_attachments;

-- Create simplified conversation_participants policies
CREATE POLICY "conversation_participants_select_policy"
  ON conversation_participants
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "conversation_participants_insert_policy"
  ON conversation_participants
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "conversation_participants_update_policy"
  ON conversation_participants
  FOR UPDATE
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "conversation_participants_delete_policy"
  ON conversation_participants
  FOR DELETE
  TO public
  USING (user_id = auth.uid());

-- Create simplified conversations policies
CREATE POLICY "conversations_select_policy"
  ON conversations
  FOR SELECT
  TO public
  USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_insert_policy"
  ON conversations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "conversations_update_policy"
  ON conversations
  FOR UPDATE
  TO public
  USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Create simplified messages policies
CREATE POLICY "messages_select_policy"
  ON messages
  FOR SELECT
  TO public
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_policy"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "messages_update_policy"
  ON messages
  FOR UPDATE
  TO public
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Create simplified message_attachments policies
CREATE POLICY "message_attachments_select_policy"
  ON message_attachments
  FOR SELECT
  TO public
  USING (
    message_id IN (
      SELECT m.id 
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "message_attachments_insert_policy"
  ON message_attachments
  FOR INSERT
  TO public
  WITH CHECK (
    message_id IN (
      SELECT id 
      FROM messages 
      WHERE sender_id = auth.uid()
    )
  );