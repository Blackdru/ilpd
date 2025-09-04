-- Subscription Infrastructure Database Schema
-- Run this in your Supabase SQL editor to add subscription tables

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    amount INTEGER NOT NULL, -- in cents
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
    payment_method VARCHAR(50) DEFAULT 'stripe',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription usage tracking
CREATE TABLE IF NOT EXISTS subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    files_processed INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0, -- in bytes
    ai_operations INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Enhanced subscriptions table (update existing)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update subscription status check constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'unpaid', 'trialing'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_month ON subscription_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_month_year ON subscription_usage(month_year);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Add updated_at triggers
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Payment transactions policies
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment transactions" ON payment_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Subscription usage policies
CREATE POLICY "Users can view own subscription usage" ON subscription_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription usage" ON subscription_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription usage" ON subscription_usage
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscription usage" ON subscription_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to get current month usage
CREATE OR REPLACE FUNCTION get_current_month_usage(user_uuid UUID)
RETURNS TABLE (
    files_processed INTEGER,
    storage_used BIGINT,
    ai_operations INTEGER,
    api_calls INTEGER
) AS $$
DECLARE
    current_month VARCHAR(7) := to_char(NOW(), 'YYYY-MM');
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(su.files_processed, 0),
        COALESCE(su.storage_used, 0),
        COALESCE(su.ai_operations, 0),
        COALESCE(su.api_calls, 0)
    FROM subscription_usage su
    WHERE su.user_id = user_uuid 
    AND su.month_year = current_month;
    
    -- If no record exists, return zeros
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0, 0::BIGINT, 0, 0;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
    user_uuid UUID,
    files_delta INTEGER DEFAULT 0,
    storage_delta BIGINT DEFAULT 0,
    ai_delta INTEGER DEFAULT 0,
    api_delta INTEGER DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
    current_month VARCHAR(7) := to_char(NOW(), 'YYYY-MM');
BEGIN
    INSERT INTO subscription_usage (user_id, month_year, files_processed, storage_used, ai_operations, api_calls)
    VALUES (user_uuid, current_month, files_delta, storage_delta, ai_delta, api_delta)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET
        files_processed = subscription_usage.files_processed + files_delta,
        storage_used = subscription_usage.storage_used + storage_delta,
        ai_operations = subscription_usage.ai_operations + ai_delta,
        api_calls = subscription_usage.api_calls + api_delta,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current subscription with usage
CREATE OR REPLACE FUNCTION get_user_subscription_with_usage(user_uuid UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan VARCHAR(50),
    status VARCHAR(50),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN,
    files_processed INTEGER,
    storage_used BIGINT,
    ai_operations INTEGER,
    api_calls INTEGER
) AS $$
DECLARE
    current_month VARCHAR(7) := to_char(NOW(), 'YYYY-MM');
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan,
        s.status,
        s.current_period_end,
        s.cancel_at_period_end,
        COALESCE(su.files_processed, 0),
        COALESCE(su.storage_used, 0),
        COALESCE(su.ai_operations, 0),
        COALESCE(su.api_calls, 0)
    FROM subscriptions s
    LEFT JOIN subscription_usage su ON s.user_id = su.user_id AND su.month_year = current_month
    WHERE s.user_id = user_uuid
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;