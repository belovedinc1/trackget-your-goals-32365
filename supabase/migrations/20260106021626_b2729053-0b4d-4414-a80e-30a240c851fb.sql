-- Create recurring expense templates table
CREATE TABLE public.recurring_expense_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    schedule_day INTEGER NOT NULL CHECK (schedule_day >= 1 AND schedule_day <= 31),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_expense_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring expense templates
CREATE POLICY "Users can view their own recurring templates"
ON public.recurring_expense_templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring templates"
ON public.recurring_expense_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring templates"
ON public.recurring_expense_templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring templates"
ON public.recurring_expense_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Create budget limits table
CREATE TABLE public.budget_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    category TEXT NOT NULL,
    monthly_limit NUMERIC NOT NULL,
    alert_threshold INTEGER NOT NULL DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE public.budget_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for budget limits
CREATE POLICY "Users can view their own budget limits"
ON public.budget_limits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget limits"
ON public.budget_limits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget limits"
ON public.budget_limits
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget limits"
ON public.budget_limits
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_recurring_expense_templates_updated_at
BEFORE UPDATE ON public.recurring_expense_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_limits_updated_at
BEFORE UPDATE ON public.budget_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();