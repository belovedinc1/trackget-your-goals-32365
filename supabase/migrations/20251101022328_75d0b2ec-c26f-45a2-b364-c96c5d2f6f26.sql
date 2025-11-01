-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly', 'quarterly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_billing_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused')),
  category TEXT,
  description TEXT,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON public.subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'checking', 'credit', 'investment', 'other')),
  bank_name TEXT NOT NULL,
  account_number TEXT,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts"
ON public.bank_accounts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank accounts"
ON public.bank_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts"
ON public.bank_accounts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts"
ON public.bank_accounts
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add account_id to expenses table to link transactions with bank accounts
ALTER TABLE public.expenses
ADD COLUMN account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);
CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX idx_expenses_account_id ON public.expenses(account_id);