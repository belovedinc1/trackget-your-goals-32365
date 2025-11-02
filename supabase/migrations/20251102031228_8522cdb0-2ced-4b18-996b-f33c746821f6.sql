-- Add default currency to user preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS default_currency text NOT NULL DEFAULT 'USD'
CHECK (default_currency IN ('USD', 'EUR', 'INR', 'JPY'));

-- Create virtual cards table
CREATE TABLE IF NOT EXISTS virtual_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_name text NOT NULL,
  card_balance numeric NOT NULL DEFAULT 0 CHECK (card_balance >= 0),
  card_color text NOT NULL DEFAULT '#1E3A8A',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on virtual_cards
ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for virtual_cards
CREATE POLICY "Users can view their own virtual cards"
  ON virtual_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own virtual cards"
  ON virtual_cards FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (SELECT COUNT(*) FROM virtual_cards WHERE user_id = auth.uid()) < 50
  );

CREATE POLICY "Users can update their own virtual cards"
  ON virtual_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own virtual cards"
  ON virtual_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at on virtual_cards
CREATE TRIGGER update_virtual_cards_updated_at
  BEFORE UPDATE ON virtual_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();