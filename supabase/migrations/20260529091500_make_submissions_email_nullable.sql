-- Allow anonymous submissions without an email.
-- Email is now collected on the payoff screen ("save this ritual"), after the
-- user has heard their audio — so the capture step no longer requires it.
ALTER TABLE public.submissions ALTER COLUMN email DROP NOT NULL;
