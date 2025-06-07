/*
  # Fix infinite recursion in conversation participants RLS policies

  1. Security Updates
    - Drop existing problematic policies on conversation_participants
    - Create simplified, non-recursive policies
    - Ensure conversations and messages policies are also correct
    - Add proper indexes for performance

  2. Policy Changes
    - conversation_participants: Simple user-based access without recursion
    - conversations: Access based on participation without circular references
    - messages: Access based on conversation participation

  This migration fixes the infinite recursion error by simplifying the RLS policies
  and removing any circular dependencies between tables.
*/

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view message attachments in their conversations" ON message_attachments;
DROP POLICY IF EXISTS "Users can insert message attachments for their messages" ON message_attachments;

-- Create simplified policies for conversation_participants
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

-- Create simplified policies for conversations
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

-- Create simplified policies for messages
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

-- Create simplified policies for message_attachments
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id 
  ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id 
  ON conversation_participants(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
  ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
  ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id 
  ON message_attachments(message_id);