-- Migration 1: Admins
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read admins" ON public.admins;
CREATE POLICY "Admins can read admins"
  ON public.admins FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

DROP POLICY IF EXISTS "Submissions are readable" ON public.submissions;
DROP POLICY IF EXISTS "Submissions are updatable" ON public.submissions;

CREATE POLICY "Admins can read submissions"
  ON public.submissions FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Events are readable" ON public.events;
CREATE POLICY "Admins can read events"
  ON public.events FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Feedback is readable" ON public.feedback;
CREATE POLICY "Admins can read feedback"
  ON public.feedback FOR SELECT USING (public.is_admin());

-- Migration 2: User ownership of submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);

DROP POLICY IF EXISTS "Users can read own submissions" ON public.submissions;
CREATE POLICY "Users can read own submissions"
  ON public.submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
CREATE POLICY "Users can update own submissions"
  ON public.submissions FOR UPDATE USING (auth.uid() = user_id);

-- Migration 3: Listening log + extra submission fields
CREATE TABLE IF NOT EXISTS public.listening_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  listened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER
);

ALTER TABLE public.listening_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own listens" ON public.listening_log;
CREATE POLICY "Users can read own listens"
  ON public.listening_log FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own listens" ON public.listening_log;
CREATE POLICY "Users can insert own listens"
  ON public.listening_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_listening_log_user
  ON public.listening_log(user_id, listened_at DESC);

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS listen_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_listened_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS title TEXT;