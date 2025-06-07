/*
  # Add INSERT policy for user_wallets table

  1. Security
    - Add policy for authenticated users to insert their own wallet records
    - Users can only create wallets for themselves (auth.uid() = user_id)

  This fixes the RLS violation error when users try to create their wallet for the first time.
*/

CREATE POLICY "Users can insert their own wallet"
  ON user_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);