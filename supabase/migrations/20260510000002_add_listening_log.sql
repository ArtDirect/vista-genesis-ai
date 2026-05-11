-- Add streak tracking and listening history for retention.

-- Track daily listens (one row per user per day)
CREATE TABLE IF NOT EXISTS public.listening_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  listened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER
);

ALTER TABLE public.listening_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own listens"
  ON public.listening_log FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listens"
  ON public.listening_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_listening_log_user ON public.listening_log(user_id, listened_at DESC);

-- Add streak + last_listened columns to profiles-like tracking on submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS listen_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_listened_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS title TEXT;
