-- Add next_payment_date column to emi_loans table
ALTER TABLE public.emi_loans 
ADD COLUMN next_payment_date DATE NOT NULL DEFAULT CURRENT_DATE;