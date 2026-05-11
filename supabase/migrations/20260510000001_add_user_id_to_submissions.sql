-- Add user_id to submissions to link to authenticated users.
-- This enables "My Audios" page and user-owned data.

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);

-- Allow authenticated users to read their own submissions
CREATE POLICY "Users can read own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to update their own submissions (edit script)
CREATE POLICY "Users can update own submissions"
  ON public.submissions FOR UPDATE
  USING (auth.uid() = user_id);
