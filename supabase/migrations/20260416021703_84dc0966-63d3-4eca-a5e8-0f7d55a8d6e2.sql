
-- Split Expenses table
CREATE TABLE public.split_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.split_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own split expenses" ON public.split_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own split expenses" ON public.split_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own split expenses" ON public.split_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own split expenses" ON public.split_expenses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_split_expenses_updated_at BEFORE UPDATE ON public.split_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Split Expense Participants table
CREATE TABLE public.split_expense_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  split_expense_id UUID NOT NULL REFERENCES public.split_expenses(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  share_amount NUMERIC NOT NULL,
  is_settled BOOLEAN NOT NULL DEFAULT false,
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.split_expense_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants of their splits" ON public.split_expense_participants FOR SELECT USING (EXISTS (SELECT 1 FROM public.split_expenses WHERE split_expenses.id = split_expense_participants.split_expense_id AND split_expenses.user_id = auth.uid()));
CREATE POLICY "Users can add participants to their splits" ON public.split_expense_participants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.split_expenses WHERE split_expenses.id = split_expense_participants.split_expense_id AND split_expenses.user_id = auth.uid()));
CREATE POLICY "Users can update participants of their splits" ON public.split_expense_participants FOR UPDATE USING (EXISTS (SELECT 1 FROM public.split_expenses WHERE split_expenses.id = split_expense_participants.split_expense_id AND split_expenses.user_id = auth.uid()));
CREATE POLICY "Users can delete participants of their splits" ON public.split_expense_participants FOR DELETE USING (EXISTS (SELECT 1 FROM public.split_expenses WHERE split_expenses.id = split_expense_participants.split_expense_id AND split_expenses.user_id = auth.uid()));

-- Investments table
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'stock',
  platform TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  buy_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  buy_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Monthly Challenges table
CREATE TABLE public.monthly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'savings_target',
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  reward_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.monthly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenges" ON public.monthly_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own challenges" ON public.monthly_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenges" ON public.monthly_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own challenges" ON public.monthly_challenges FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_challenges_updated_at BEFORE UPDATE ON public.monthly_challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
