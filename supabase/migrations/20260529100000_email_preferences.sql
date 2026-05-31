-- Tracks which emails want the daily ritual reminder and when one was last sent.
-- Populated when a user saves their email on the payoff screen (the consent
-- moment). Service-role only — no public access.
CREATE TABLE IF NOT EXISTS public.email_preferences (
  email TEXT PRIMARY KEY,
  reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  last_reminder_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
-- No policies: anon/auth get no access; the edge functions use the service role,
-- which bypasses RLS.
