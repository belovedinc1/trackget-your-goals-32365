
-- Roles enum for household members
CREATE TYPE public.household_role AS ENUM ('owner', 'editor', 'viewer');

-- Households
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.household_role NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);

CREATE TABLE public.household_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  role public.household_role NOT NULL DEFAULT 'viewer',
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

-- Link expenses to a household (optional)
ALTER TABLE public.expenses ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE SET NULL;
CREATE INDEX idx_expenses_household ON public.expenses(household_id);

-- Security definer helpers (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_household_member(_household_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = _household_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_household_role(_household_id UUID, _user_id UUID)
RETURNS public.household_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.household_members
  WHERE household_id = _household_id AND user_id = _user_id;
$$;

-- Enable RLS
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;

-- households policies
CREATE POLICY "Members can view their households" ON public.households
  FOR SELECT USING (public.is_household_member(id, auth.uid()));

CREATE POLICY "Users can create households" ON public.households
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update household" ON public.households
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete household" ON public.households
  FOR DELETE USING (auth.uid() = owner_id);

-- household_members policies
CREATE POLICY "Members can view co-members" ON public.household_members
  FOR SELECT USING (public.is_household_member(household_id, auth.uid()));

CREATE POLICY "Owner can add members" ON public.household_members
  FOR INSERT WITH CHECK (
    public.get_household_role(household_id, auth.uid()) = 'owner'
    OR auth.uid() = user_id  -- allow self-insert when accepting invite
  );

CREATE POLICY "Owner can update member roles" ON public.household_members
  FOR UPDATE USING (public.get_household_role(household_id, auth.uid()) = 'owner');

CREATE POLICY "Owner can remove members or self leave" ON public.household_members
  FOR DELETE USING (
    public.get_household_role(household_id, auth.uid()) = 'owner'
    OR auth.uid() = user_id
  );

-- household_invitations policies
CREATE POLICY "Owners can view invitations" ON public.household_invitations
  FOR SELECT USING (public.get_household_role(household_id, auth.uid()) = 'owner');

CREATE POLICY "Owners can create invitations" ON public.household_invitations
  FOR INSERT WITH CHECK (
    public.get_household_role(household_id, auth.uid()) = 'owner'
    AND auth.uid() = invited_by
  );

CREATE POLICY "Owners can delete invitations" ON public.household_invitations
  FOR DELETE USING (public.get_household_role(household_id, auth.uid()) = 'owner');

CREATE POLICY "Owners can update invitations" ON public.household_invitations
  FOR UPDATE USING (public.get_household_role(household_id, auth.uid()) = 'owner');

-- Update expenses RLS to allow household members
DROP POLICY "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view own or household expenses" ON public.expenses
  FOR SELECT USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid()))
  );

DROP POLICY "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update own or household-editable expenses" ON public.expenses
  FOR UPDATE USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND public.get_household_role(household_id, auth.uid()) IN ('owner', 'editor'))
  );

-- Triggers
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-add owner as member
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER households_add_owner AFTER INSERT ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();

-- Anonymous benchmarks function
CREATE OR REPLACE FUNCTION public.get_category_benchmarks()
RETURNS TABLE (category TEXT, avg_monthly_spend NUMERIC, user_count BIGINT)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH user_monthly AS (
    SELECT
      user_id,
      category,
      date_trunc('month', expense_date) AS month,
      SUM(amount) AS monthly_total
    FROM public.expenses
    WHERE type = 'expense' OR type IS NULL
    GROUP BY user_id, category, date_trunc('month', expense_date)
  ),
  user_avg AS (
    SELECT user_id, category, AVG(monthly_total) AS user_avg
    FROM user_monthly
    GROUP BY user_id, category
  )
  SELECT
    category,
    ROUND(AVG(user_avg)::NUMERIC, 2) AS avg_monthly_spend,
    COUNT(DISTINCT user_id) AS user_count
  FROM user_avg
  GROUP BY category
  HAVING COUNT(DISTINCT user_id) >= 5
  ORDER BY avg_monthly_spend DESC;
$$;
