/*
  # Create messages tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    - `conversation_participants`
      - `conversation_id` (uuid, foreign key to conversations)
      - `user_id` (uuid, foreign key to users)
      - `joined_at` (timestamp with time zone)
      - `last_read_at` (timestamp with time zone)
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations)
      - `sender_id` (uuid, foreign key to users)
      - `content` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `is_read` (boolean)
      - `metadata` (jsonb)
    - `message_attachments`
      - `id` (uuid, primary key)
      - `message_id` (uuid, foreign key to messages)
      - `file_url` (text)
      - `file_type` (text)
      - `file_name` (text)
      - `file_size` (integer)
      - `created_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own conversations and messages
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_participants table
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
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  created_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on conversations
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update updated_at on messages
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view conversations they are part of"
  ON conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

-- Create policies for conversation_participants
CREATE POLICY "Users can view conversation participants for their conversations"
  ON conversation_participants
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversation_participants.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to conversations they are part of"
  ON conversation_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = NEW.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participant status"
  ON conversation_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for messages
CREATE POLICY "Users can view messages in conversations they are part of"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to conversations they are part of"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = NEW.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Create policies for message_attachments
CREATE POLICY "Users can view attachments for messages they can see"
  ON message_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversation_participants ON messages.conversation_id = conversation_participants.conversation_id
      WHERE messages.id = message_attachments.message_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add attachments to their own messages"
  ON message_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = NEW.message_id
      AND messages.sender_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);