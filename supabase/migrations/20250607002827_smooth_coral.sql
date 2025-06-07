/*
  # Create messaging system tables

  1. New Tables
    - `conversations` - Stores conversation metadata
    - `conversation_participants` - Stores participants in conversations
    - `messages` - Stores individual messages
    - `message_attachments` - Stores file attachments for messages

  2. Security
    - Enable RLS on all tables
    - Add policies for conversation participants to manage their conversations
    - Add policies for message access
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  is_pinned boolean DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create message attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view conversations they participate in"
  ON conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Create policies for conversation participants
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participation"
  ON conversation_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own participation"
  ON conversation_participants
  FOR DELETE
  USING (user_id = auth.uid());

-- Create policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Create policies for message attachments
CREATE POLICY "Users can view message attachments in their conversations"
  ON message_attachments
  FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM messages
      WHERE conversation_id IN (
        SELECT conversation_id FROM conversation_participants
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert message attachments for their messages"
  ON message_attachments
  FOR INSERT
  WITH CHECK (
    message_id IN (
      SELECT id FROM messages
      WHERE sender_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();