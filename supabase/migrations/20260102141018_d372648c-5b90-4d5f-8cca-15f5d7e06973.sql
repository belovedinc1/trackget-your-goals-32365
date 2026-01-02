-- Schedule daily recurring payments processing at 6 AM UTC
SELECT cron.schedule(
  'process-recurring-payments-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lgnowiyptxuyhibptqga.supabase.co/functions/v1/process-recurring-payments',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnbm93aXlwdHh1eWhpYnB0cWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyODUzMDQsImV4cCI6MjA3Njg2MTMwNH0.zCqIFPLTEydk1JSbjkK1L4UKrMb4Gwd4rTLb-pXpkMA"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);