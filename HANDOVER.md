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
Core record per dream. Notable columns: `email`, `input_type` (`text`|`voice`), `raw_text`, `voice_file_url`, `voice_file_path`, `transcript_text`, `polished_script`, `audio_url`, `audio_file_path`, `status` (default `new`), `user_id` (nullable, FK-ish to `auth.users`), `listen_count`, `last_listened_at`, `title`, `consent_given`, `utm_source`, `utm_campaign`.

RLS: anyone can INSERT; owners (`auth.uid() = user_id`) can SELECT/UPDATE own; admins (`is_admin()`) can SELECT/UPDATE all. No DELETE policy.

### `events`
Funnel analytics. `event_name`, `page`, `submission_id`, `utm_source`, `utm_campaign`. Anyone can INSERT; admins can SELECT.

### `feedback`
`email`, `feedback_text`, `submission_id`. Anyone can INSERT; admins can SELECT.

### `admins`
`user_id PK`. Admins can SELECT only — no INSERT/UPDATE/DELETE policies, so seeding must happen via migration or service role.

### `listening_log`
`user_id`, `submission_id`, `listened_at`, `duration_seconds`. Owners INSERT/SELECT own rows. Drives streaks + listen count in `/my-audios`.

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

Path: `supabase/functions/<name>/index.ts`. Auto-deployed by Lovable. Default `verify_jwt = false`.

| Function | What it does |
|---|---|
| `polish-script` | Calls Lovable AI Gateway (`openai/gpt-5`) with a fixed system prompt (first-person, present-tense, 8–12 lines, no clichés). Caches result in `submissions.polished_script`. Handles 429/402 from gateway. |
| `generate-audio` | Calls ElevenLabs TTS (voice `EXAVITQu4vr4xnSDxMaL` Sarah, `eleven_multilingual_v2`). Uploads MP3 to `manifestations` bucket, writes `audio_url` + `audio_file_path`, sets `status='ready'`. **Rate-limited: max 5 generations per email.** Returns cached `audio_url` if already generated. |
| `transcribe-audio` | Downloads audio from `voice_file_url`, transcribes via Whisper through Lovable Gateway (fallback: direct `OPENAI_API_KEY` if present). Caches into `submissions.transcript_text` + `raw_text`. |

All three verify the submission row exists via service-role REST before doing work.

---

## 5. Secrets (already configured)

- `LOVABLE_API_KEY` — Gateway access (managed; rotate via `lovable_api_key--rotate_lovable_api_key`)
- `ELEVENLABS_API_KEY` — **connector-managed**, editable only via Connectors UI
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY(S)`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEYS`, `SUPABASE_JWKS`, `SUPABASE_DB_URL` — standard

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

- ElevenLabs free-tier abuse error (see §5)
- Google OAuth not enabled
- No real test coverage — only `src/test/example.test.ts`
- Admins must be seeded manually (no UI to grant admin)
- Storage bucket `manifestations` is fully public — fine for MVP, revisit before scale
- Linter flags `is_admin()` (SECURITY DEFINER) and public bucket — both intentional

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
