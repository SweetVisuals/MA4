/*
  # Create User Wallet If Not Exists Function

  1. New Functions
    - `create_user_wallet_if_not_exists`: Creates a wallet for a user if one doesn't exist
  
  2. Trigger
    - Adds a trigger to automatically create a wallet when a new user is created
*/

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
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_wallet_if_not_exists();
  END IF;
END $$;