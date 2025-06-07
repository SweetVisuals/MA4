/*
# Dashboard Analytics Enhancement

1. New Tables
  - `user_wallets` - Stores user wallet balances
  - `analytics_events` - Stores detailed analytics events
  - `dashboard_metrics` - Stores pre-calculated dashboard metrics

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access their own data

3. Changes
  - Add functions for analytics aggregation
  - Add triggers for updating metrics
*/

-- Create user_wallets table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(12,2) DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT user_wallets_user_id_key UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_wallets
CREATE POLICY "Users can view their own wallet"
  ON user_wallets
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON user_wallets
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS user_wallets_user_id_idx ON user_wallets (user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_wallets_updated_at
BEFORE UPDATE ON user_wallets
FOR EACH ROW
EXECUTE FUNCTION update_user_wallet_updated_at();

-- Create analytics_events table for more detailed analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  event_category text NOT NULL,
  event_value numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text
);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_events
CREATE POLICY "Users can insert their own analytics events"
  ON analytics_events
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics events"
  ON analytics_events
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create indexes for analytics_events
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS analytics_events_event_category_idx ON analytics_events (event_category);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events (created_at);

-- Create dashboard_metrics table for pre-calculated metrics
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  time_period text NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
  start_date date,
  end_date date,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, metric_name, time_period, start_date, end_date)
);

-- Enable Row Level Security
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard_metrics
CREATE POLICY "Users can view their own dashboard metrics"
  ON dashboard_metrics
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create indexes for dashboard_metrics
CREATE INDEX IF NOT EXISTS dashboard_metrics_user_id_idx ON dashboard_metrics (user_id);
CREATE INDEX IF NOT EXISTS dashboard_metrics_metric_name_idx ON dashboard_metrics (metric_name);
CREATE INDEX IF NOT EXISTS dashboard_metrics_time_period_idx ON dashboard_metrics (time_period);

-- Create function to calculate dashboard metrics
CREATE OR REPLACE FUNCTION calculate_dashboard_metrics(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today date := current_date;
  week_start date := date_trunc('week', today)::date;
  month_start date := date_trunc('month', today)::date;
  year_start date := date_trunc('year', today)::date;
BEGIN
  -- Delete existing metrics for this user
  DELETE FROM dashboard_metrics WHERE user_id = user_id_param;
  
  -- Insert daily metrics
  INSERT INTO dashboard_metrics (user_id, metric_name, metric_value, time_period, start_date, end_date)
  SELECT 
    user_id_param,
    'plays',
    COALESCE(COUNT(*), 0),
    'daily',
    today,
    today
  FROM analytics_events
  WHERE user_id = user_id_param
    AND event_name = 'track_play'
    AND created_at >= today
    AND created_at < today + interval '1 day';
    
  -- Insert weekly metrics
  INSERT INTO dashboard_metrics (user_id, metric_name, metric_value, time_period, start_date, end_date)
  SELECT 
    user_id_param,
    'plays',
    COALESCE(COUNT(*), 0),
    'weekly',
    week_start,
    week_start + interval '6 days'
  FROM analytics_events
  WHERE user_id = user_id_param
    AND event_name = 'track_play'
    AND created_at >= week_start
    AND created_at < week_start + interval '7 days';
    
  -- Insert monthly metrics
  INSERT INTO dashboard_metrics (user_id, metric_name, metric_value, time_period, start_date, end_date)
  SELECT 
    user_id_param,
    'plays',
    COALESCE(COUNT(*), 0),
    'monthly',
    month_start,
    (month_start + interval '1 month' - interval '1 day')::date
  FROM analytics_events
  WHERE user_id = user_id_param
    AND event_name = 'track_play'
    AND created_at >= month_start
    AND created_at < month_start + interval '1 month';
    
  -- Insert yearly metrics
  INSERT INTO dashboard_metrics (user_id, metric_name, metric_value, time_period, start_date, end_date)
  SELECT 
    user_id_param,
    'plays',
    COALESCE(COUNT(*), 0),
    'yearly',
    year_start,
    (year_start + interval '1 year' - interval '1 day')::date
  FROM analytics_events
  WHERE user_id = user_id_param
    AND event_name = 'track_play'
    AND created_at >= year_start
    AND created_at < year_start + interval '1 year';
    
  -- Insert all-time metrics
  INSERT INTO dashboard_metrics (user_id, metric_name, metric_value, time_period, start_date, end_date)
  SELECT 
    user_id_param,
    'plays',
    COALESCE(COUNT(*), 0),
    'all_time',
    NULL,
    NULL
  FROM analytics_events
  WHERE user_id = user_id_param
    AND event_name = 'track_play';
    
  -- Add more metrics as needed (revenue, followers, etc.)
END;
$$;

-- Create a trigger function to automatically create a wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to create a wallet when a new user is created
DROP TRIGGER IF EXISTS create_user_wallet_on_signup ON auth.users;
CREATE TRIGGER create_user_wallet_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_wallet();

-- Create a function to give gems to users
CREATE OR REPLACE FUNCTION give_gem(from_user_id uuid, to_user_id uuid, track_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  from_user_gems integer;
BEGIN
  -- Check if from_user has gems
  SELECT gems INTO from_user_gems
  FROM user_stats
  WHERE user_id = from_user_id;
  
  IF from_user_gems IS NULL OR from_user_gems < 1 THEN
    RETURN false;
  END IF;
  
  -- Deduct gem from from_user
  UPDATE user_stats
  SET gems = gems - 1
  WHERE user_id = from_user_id;
  
  -- Add gem to to_user
  UPDATE user_stats
  SET gems = gems + 1
  WHERE user_id = to_user_id;
  
  -- Record the transaction
  INSERT INTO analytics_events (
    user_id,
    event_name,
    event_category,
    event_value,
    metadata
  ) VALUES (
    from_user_id,
    'gem_given',
    'engagement',
    1,
    jsonb_build_object('recipient_id', to_user_id, 'track_id', track_id)
  );
  
  RETURN true;
END;
$$;