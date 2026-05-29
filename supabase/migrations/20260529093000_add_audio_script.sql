-- Track the exact script text that produced the current audio. Lets
-- generate-audio (a) return cached audio only when the script is unchanged and
-- (b) regenerate after the user edits the script, without re-charging a credit.
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS audio_script TEXT;
