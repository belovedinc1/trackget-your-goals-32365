-- Add database constraints for input validation
-- Expenses table constraints
ALTER TABLE expenses 
  ADD CONSTRAINT check_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT check_amount_reasonable CHECK (amount <= 10000000),
  ADD CONSTRAINT check_description_length CHECK (length(description) <= 500);

-- Bank accounts table constraints
ALTER TABLE bank_accounts 
  ADD CONSTRAINT check_current_balance_positive CHECK (current_balance >= 0),
  ADD CONSTRAINT check_initial_balance_reasonable CHECK (initial_balance >= 0 AND initial_balance <= 10000000);

-- Savings goals table constraints
ALTER TABLE savings_goals 
  ADD CONSTRAINT check_target_amount_positive CHECK (target_amount > 0),
  ADD CONSTRAINT check_current_amount_non_negative CHECK (current_amount >= 0);

-- EMI loans table constraints
ALTER TABLE emi_loans 
  ADD CONSTRAINT check_loan_amount_positive CHECK (loan_amount > 0),
  ADD CONSTRAINT check_emi_amount_positive CHECK (emi_amount > 0),
  ADD CONSTRAINT check_outstanding_amount_non_negative CHECK (outstanding_amount >= 0),
  ADD CONSTRAINT check_interest_rate_valid CHECK (interest_rate >= 0 AND interest_rate <= 100),
  ADD CONSTRAINT check_tenure_positive CHECK (tenure_months > 0);

-- Subscriptions table constraints
ALTER TABLE subscriptions 
  ADD CONSTRAINT check_subscription_amount_positive CHECK (amount > 0);

-- Virtual cards table constraints
ALTER TABLE virtual_cards 
  ADD CONSTRAINT check_card_balance_non_negative CHECK (card_balance >= 0);

-- Tracked products table constraints
ALTER TABLE tracked_products 
  ADD CONSTRAINT check_current_price_positive CHECK (current_price > 0),
  ADD CONSTRAINT check_target_price_positive CHECK (target_price IS NULL OR target_price > 0);

-- Drop existing receipts policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own receipts" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
END $$;

-- Add RLS policies for receipts bucket
CREATE POLICY "Users can upload their own receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own receipts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);