-- Create tracked_products table
CREATE TABLE IF NOT EXISTS public.tracked_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  target_price NUMERIC,
  platform TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracked_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tracked products"
ON public.tracked_products
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracked products"
ON public.tracked_products
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracked products"
ON public.tracked_products
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked products"
ON public.tracked_products
FOR DELETE
USING (auth.uid() = user_id);

-- Create price_history table
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.tracked_products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Create policies for price_history
CREATE POLICY "Users can view price history for their products"
ON public.price_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tracked_products
    WHERE tracked_products.id = price_history.product_id
    AND tracked_products.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert price history for their products"
ON public.price_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tracked_products
    WHERE tracked_products.id = price_history.product_id
    AND tracked_products.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_tracked_products_updated_at
BEFORE UPDATE ON public.tracked_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_tracked_products_user_id ON public.tracked_products(user_id);
CREATE INDEX idx_price_history_product_id ON public.price_history(product_id);
CREATE INDEX idx_price_history_recorded_at ON public.price_history(recorded_at);