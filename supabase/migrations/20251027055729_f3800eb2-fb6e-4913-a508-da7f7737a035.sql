-- Create savings_goals table
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  goal_type TEXT NOT NULL,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own goals" 
ON public.savings_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.savings_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.savings_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.savings_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_savings_goals_updated_at
BEFORE UPDATE ON public.savings_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create savings_transactions table for detailed tracking
CREATE TABLE public.savings_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on savings_transactions
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for savings_transactions
CREATE POLICY "Users can view transactions for their goals" 
ON public.savings_transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.savings_goals 
    WHERE savings_goals.id = savings_transactions.goal_id 
    AND savings_goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create transactions for their goals" 
ON public.savings_transactions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.savings_goals 
    WHERE savings_goals.id = savings_transactions.goal_id 
    AND savings_goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete transactions for their goals" 
ON public.savings_transactions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.savings_goals 
    WHERE savings_goals.id = savings_transactions.goal_id 
    AND savings_goals.user_id = auth.uid()
  )
);