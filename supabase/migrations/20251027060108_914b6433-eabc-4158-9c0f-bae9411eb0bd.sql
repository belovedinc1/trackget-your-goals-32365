-- Create emi_loans table
CREATE TABLE public.emi_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lender_name TEXT NOT NULL,
  loan_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  tenure_months INTEGER NOT NULL,
  emi_amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  outstanding_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.emi_loans ENABLE ROW LEVEL SECURITY;

-- Create policies for emi_loans
CREATE POLICY "Users can view their own loans" 
ON public.emi_loans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loans" 
ON public.emi_loans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" 
ON public.emi_loans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans" 
ON public.emi_loans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_emi_loans_updated_at
BEFORE UPDATE ON public.emi_loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create emi_payments table for tracking payment history
CREATE TABLE public.emi_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.emi_loans(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount_paid NUMERIC NOT NULL,
  principal_component NUMERIC NOT NULL,
  interest_component NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on emi_payments
ALTER TABLE public.emi_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for emi_payments
CREATE POLICY "Users can view payments for their loans" 
ON public.emi_payments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.emi_loans 
    WHERE emi_loans.id = emi_payments.loan_id 
    AND emi_loans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create payments for their loans" 
ON public.emi_payments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.emi_loans 
    WHERE emi_loans.id = emi_payments.loan_id 
    AND emi_loans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update payments for their loans" 
ON public.emi_payments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.emi_loans 
    WHERE emi_loans.id = emi_payments.loan_id 
    AND emi_loans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete payments for their loans" 
ON public.emi_payments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.emi_loans 
    WHERE emi_loans.id = emi_payments.loan_id 
    AND emi_loans.user_id = auth.uid()
  )
);

-- Create user_preferences table for notification settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  reminder_days_before INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();