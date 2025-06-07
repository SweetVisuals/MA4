/*
  # Create user wallet trigger

  1. New Functions
    - `create_user_wallet_if_not_exists`: Creates a wallet for a user if one doesn't exist
    - `update_user_wallet_updated_at`: Updates the updated_at timestamp when a wallet is modified
  
  2. Security
    - Enable RLS on user_wallets table
    - Add policies for wallet access
*/

-- Function to update the updated_at timestamp when a wallet is modified
CREATE OR REPLACE FUNCTION update_user_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create a user wallet if it doesn't exist
CREATE OR REPLACE FUNCTION create_user_wallet_if_not_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user already has a wallet
  IF NOT EXISTS (
    SELECT 1 FROM user_wallets WHERE user_id = NEW.id
  ) THEN
    -- Create a new wallet with 0 balance
    INSERT INTO user_wallets (user_id, balance)
    VALUES (NEW.id, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically create a wallet when a new user is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'create_user_wallet_on_user_create'
  ) THEN
    CREATE TRIGGER create_user_wallet_on_user_create
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_wallet_if_not_exists();
  END IF;
END $$;

-- Enable RLS on user_wallets table if not already enabled
ALTER TABLE IF EXISTS user_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_wallets table if they don't exist
DO $$
BEGIN
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_wallets' AND policyname = 'Users can insert their own wallet'
  ) THEN
    CREATE POLICY "Users can insert their own wallet"
    ON user_wallets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_wallets' AND policyname = 'Users can view their own wallet'
  ) THEN
    CREATE POLICY "Users can view their own wallet"
    ON user_wallets
    FOR SELECT
    TO public
    USING (auth.uid() = user_id);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_wallets' AND policyname = 'Users can update their own wallet'
  ) THEN
    CREATE POLICY "Users can update their own wallet"
    ON user_wallets
    FOR UPDATE
    TO public
    USING (auth.uid() = user_id);
  END IF;
END $$;