# Handover — Manifestation MVP

Single-doc handover so a new agent (Claude Code) can be productive without re-discovering the project.

---

## 1. Product snapshot

Mobile-first manifestation MVP. User flow:

**Dream (text or voice) → Polished script (GPT-5) → Voiced audio (ElevenLabs) → Personal library + streaks.**

- **Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Lovable Cloud (= managed Supabase) — Postgres, Auth, Storage, Edge Functions
- **AI:** Lovable AI Gateway (`openai/gpt-5` for script polishing, Whisper for STT) + ElevenLabs (TTS)
- **Theme:** dark indigo `#0D0D2B` background, coral `#C8573A` CTA, Cormorant Garamond (display) + DM Sans (body)

---

## 2. Routes & pages

| Route | File | Purpose |
|---|---|---|
| `/` | `src/pages/LandingPage.tsx` | Hero + CTA → `/ritual` |
| `/ritual` | `src/pages/RitualPage.tsx` | 4-step flow: Capture → Loading → Script → Audio |
| `/login` | `src/pages/LoginPage.tsx` | Magic link + email/password |
| `/my-audios` | `src/pages/MyAudiosPage.tsx` | User library, listen count, streaks |
| `/admin` | `src/pages/AdminPage.tsx` | Admin dashboard — gated by `public.admins` row (the old `manifest2026` password gate is gone) |
| `/thanks` | `src/pages/ThanksPage.tsx` | Post-submit thank-you |
| `/create` | — | Redirects to `/ritual` |
| `*` | `src/pages/NotFound.tsx` | 404 |

Routing lives in `src/App.tsx`, wrapped in `AuthProvider` (`src/lib/auth.tsx`).

---

## 3. Backend — database

All tables live in `public`. RLS is enabled on every one.

### `submissions`
Core record per dream. Notable columns: `email` (**nullable** — collected on the payoff screen now, not upfront), `input_type` (`text`|`voice`), `raw_text`, `voice_file_url`, `voice_file_path`, `transcript_text`, `polished_script`, `audio_url`, `audio_file_path`, `audio_script` (the exact script that produced `audio_url` — drives caching/regeneration in `generate-audio`), `status` (default `new`), `user_id` (nullable, FK-ish to `auth.users`), `listen_count`, `last_listened_at`, `title`, `consent_given`, `utm_source`, `utm_campaign`.

RLS: anyone can INSERT; owners (`auth.uid() = user_id`) can SELECT/UPDATE own; admins (`is_admin()`) can SELECT/UPDATE all. No DELETE policy. **Anonymous clients cannot UPDATE** (no `user_id`) — that's why `save-email` writes the email via service role.

### `events`
Funnel analytics. `event_name`, `page`, `submission_id`, `utm_source`, `utm_campaign`. Anyone can INSERT; admins can SELECT.

### `feedback`
`email`, `feedback_text`, `submission_id`. Anyone can INSERT; admins can SELECT.

### `admins`
`user_id PK`. Admins can SELECT only — no INSERT/UPDATE/DELETE policies, so seeding must happen via migration or service role.

### `listening_log`
`user_id`, `submission_id`, `listened_at`, `duration_seconds`. Owners INSERT/SELECT own rows. Drives streaks + listen count in `/my-audios`.

### `user_credits`
Per-user audio-generation balance. `user_id PK`, `balance` (default **3**, `check >= 0`), `total_granted` (default 3), timestamps. New signups get 3 credits via the `handle_new_user_credits()` trigger (existing users backfilled). Mutated only through SECURITY DEFINER RPCs, execute granted to `service_role` only:
- `consume_credit(p_user_id)` — atomic `balance = balance - 1 where balance > 0`, returns new balance (can't go negative; no double-spend).
- `grant_credits(p_user_id, p_amount)` — add credits.

### `email_preferences`
Reminder opt-in + send dedup. `email PK`, `reminders_enabled` (default true), `last_reminder_at`, `created_at`. RLS enabled with **no policies** — service-role only (the email functions). Populated when a user saves their email on the payoff screen.

### Function
```sql
is_admin() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER
  → EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
```
Used inside RLS policies. Intentional SECURITY DEFINER.

### Storage
- Bucket **`manifestations`** — public. Holds generated `.mp3`s and (optionally) uploaded voice notes.

### Realtime
Not enabled on any table.

---

## 4. Edge functions

Path: `supabase/functions/<name>/index.ts`. Auto-deployed by Lovable. Functions run **unauthenticated** (`verify_jwt` effectively false — the anonymous-first-audio flow depends on it), so each does its own service-role checks. See §10 for the security caveats this implies.

| Function | What it does |
|---|---|
| `polish-script` | Calls Lovable AI Gateway (`openai/gpt-5`), fixed system prompt (first-person, present-tense, 8–12 lines, no clichés). Caches into `submissions.polished_script`. Handles 429/402 from gateway. **Caps `dream` at 5000 chars.** No spend gate of its own — see §10. |
| `generate-audio` | ElevenLabs TTS (voice `EXAVITQu4vr4xnSDxMaL` Sarah, `eleven_multilingual_v2`) → uploads MP3 → writes `audio_url`, `audio_file_path`, `audio_script`, `status='ready'`. **Credits model:** signed-in users spend 1 credit (`consume_credit`); anonymous users get `FREE_ANON_AUDIOS_PER_EMAIL` (=1) free per email, then a `sign_in_required` response. Returns structured errors `{error, message, scriptPreserved, retryable}` with 401/402/503. **Charges only on first generation per submission**; editing the script regenerates (cache miss on `audio_script`) for free. Returns cached `audio_url` when the script is unchanged. **Caps `script` at 5000 chars.** Logs funnel events. |
| `transcribe-audio` | Downloads audio from `voice_file_url`, transcribes via Whisper through Lovable Gateway (fallback: direct `OPENAI_API_KEY`). Caches `transcript_text` + `raw_text`. |
| `save-email` | Service-role write of `email` onto an (anonymous) submission from the payoff screen — anon clients can't UPDATE submissions under RLS. **First-write-wins** (won't overwrite an existing email → caps to one email per submission). Registers the reminder opt-in in `email_preferences`, then sends the "your ritual is ready" email via Resend (best-effort — a send failure never fails the save). |
| `send-daily-rituals` | **Cron-triggered**, protected by an `x-cron-secret` header (`CRON_SECRET`). Emails each subscribed address (from `email_preferences`, not reminded in the last ~20h) their most recent ritual with audio; updates `last_reminder_at`. Skips addresses with no voiced ritual. Reply includes a signed unsubscribe link. |
| `unsubscribe` | Public GET from the unsubscribe link. Verifies an HMAC token (`UNSUB_SECRET`) over the email so links can't be forged, sets `reminders_enabled=false`, returns a confirmation page. |

`polish-script`, `generate-audio`, `transcribe-audio`, `save-email` verify the submission row exists via service-role REST before doing work.

### Email & reminders — activation
The email features are **dormant until secrets + a cron job are set** (see §5). To schedule the daily send, run in the Supabase SQL editor (uses `pg_cron` + `pg_net`):
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('send-daily-rituals', '0 13 * * *', $$
  select net.http_post(
    url := 'https://ydakiibqaciinvxjbezy.supabase.co/functions/v1/send-daily-rituals',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>'),
    body := '{}'::jsonb);
$$);
```
The secret is **not** committed (public repo). Test the function independent of the schedule with a `curl -X POST .../send-daily-rituals -H "x-cron-secret: <CRON_SECRET>"`.

---

## 5. Secrets

### Already configured

- `LOVABLE_API_KEY` — Gateway access (managed; rotate via `lovable_api_key--rotate_lovable_api_key`)
- `ELEVENLABS_API_KEY` — **connector-managed**, editable only via Connectors UI
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY(S)`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEYS`, `SUPABASE_JWKS`, `SUPABASE_DB_URL` — standard

### Email & reminders (must be added to activate those features)
- `RESEND_API_KEY` — Resend API key. **Without it, emails are silently skipped** (saves still succeed). Until a sending **domain is verified in Resend**, emails only deliver to your own Resend account address.
- `RESEND_FROM` — optional, e.g. `ManifestFlow <hello@yourdomain.com>`. Defaults to `onboarding@resend.dev` (test-only).
- `APP_URL` — optional, for the "create an account" link. Defaults to the published URL.
- `CRON_SECRET` — required for `send-daily-rituals`; must match the value in the cron job (§4). Without it the function returns 401.
- `UNSUB_SECRET` — signs unsubscribe links. Falls back to the service role key if unset, but set an explicit value.

⚠️ **Known issue:** ElevenLabs free-tier may be blocked by abuse detection ("Free Tier usage disabled"). If `generate-audio` 500s, upgrade the ElevenLabs account or swap the key via the connector.

---

## 6. Auth

`src/lib/auth.tsx` exposes `useAuth()` with: `user`, `session`, `loading`, `signInWithMagicLink`, `signInWithPassword`, `signUp`, `signOut`.

- Email/password + magic link enabled
- Google OAuth **not** wired (would need `supabase--configure_social_auth({ providers: ["google"] })` + UI)
- Email confirmation: default (not auto-confirmed). Magic-link redirect: `${origin}/ritual`

### Becoming admin
Insert your auth uid into `public.admins`:
```sql
INSERT INTO public.admins (user_id) VALUES ('<your-auth-uid>');
```
Run via the migration tool (or service role). The table has no INSERT policy, so client-side inserts will fail by design.

---

## 7. Analytics

`src/lib/events.ts` exports `trackEvent(event_name, page, submission_id?)` which pulls UTM from `src/lib/utm.ts` and inserts into `events`. Use for funnel telemetry — already called from `LandingPage` and `RitualPage`.

---

## 8. Read these first

1. `src/App.tsx` — routes + provider wiring
2. `src/pages/RitualPage.tsx` — the whole user-facing flow
3. `src/lib/auth.tsx`
4. `supabase/functions/*/index.ts` — backend logic
5. `src/index.css` + `tailwind.config.ts` — design tokens (use semantic tokens, not raw hex)
6. `src/integrations/supabase/{client,types}.ts` — **auto-generated, never edit**

---

## 9. Conventions & guardrails

- **Never edit:** `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `.env`
- All schema changes go through the Lovable migration tool (writes a file in `supabase/migrations/`)
- Data changes (INSERT/UPDATE/DELETE existing rows) go through the `supabase--insert` tool, not migrations
- Roles live in the `admins` table only — never on a profile/users table
- Use Tailwind semantic tokens (`bg-background`, `text-foreground`, etc.); raw colors break theming
- Only one `supabase/config.toml`; don't add per-function blocks unless a function explicitly needs non-default config

---

## 10. Open items / known gaps

**Security (important):**
- Edge functions are **unauthenticated** and CORS-open. `polish-script` has **no spend gate** (only a 5000-char cap), so it can be called in volume for GPT cost. `generate-audio`'s anonymous gate counts by `submission.email`, which is attacker-controlled (invent a new email → bypass the 1-free limit). Real fix is a product decision: gate `polish-script` too and move anonymous limits onto IP/device or require sign-in. Input length caps are in place but only bound per-call cost, not volume.
- Storage bucket `manifestations` is fully public, and now audio URLs are emailed out — anyone with a link can play the audio. Voice recordings live in the same public bucket (PII). Fine for MVP; revisit before scale.

**Email / reminders:**
- **Domain verification in Resend is the blocker to going live** — until done, all emails (save + reminders) only deliver to your own Resend address.
- Reminder time is a single fixed UTC hour for everyone (no per-user timezone). Adjust the cron expression for your market; per-user TZ is a later feature.
- `pg_cron`/`pg_net` scheduling couldn't be tested from outside; verify the job fires (`select * from cron.job;` + function logs). The manual curl (§4) tests function logic independently.

**Other:**
- ElevenLabs free-tier abuse error (see §5)
- Google OAuth not enabled
- No real test coverage — only `src/test/example.test.ts`. The pipeline has several failure branches worth covering.
- Admins must be seeded manually (no UI to grant admin)
- `AdminPage.tsx` has a pre-existing TS error (`Record<string, unknown>` vs generated row type) — unrelated to recent work
- Linter flags `is_admin()` (SECURITY DEFINER) and public bucket — both intentional

**Fixed in recent work:** email moved off the capture step to the payoff screen (lower funnel friction); background audio prefetch for near-instant reveal; recording mic/timer cleanup on unmount; per-call input caps on the AI/TTS functions.

---

## 11. Local dev

```sh
npm i
npm run dev    # port 8080
```
For local runs outside Lovable, copy `.env.example` → `.env` with the real `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (visible in Lovable Cloud settings). Inside Lovable, `.env` is auto-provided — don't touch it.

---

## 12. Deployment

- **Frontend:** auto-deploys from GitHub via Lovable on every push
- **Edge functions:** auto-deploy on push (no manual `supabase functions deploy`)
- **Migrations:** apply via the Lovable migration tool — not raw `supabase db push`
- **Published URL:** https://vista-genesis-ai.lovable.app
- **Preview URL:** https://id-preview--c83f3588-51d6-4aea-a6d4-ebf8f595a1e2.lovable.app
- **Lovable project ID:** `c83f3588-51d6-4aea-a6d4-ebf8f595a1e2`
