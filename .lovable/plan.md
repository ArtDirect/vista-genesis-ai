# Handover to Claude Code

I'll create a single `HANDOVER.md` at the project root that gives Claude Code everything it needs to pick this project up without re-discovering it.

## What goes in HANDOVER.md

**1. Project snapshot**
- Product: mobile-first manifestation MVP (Dream → Polished Script → Voiced Audio)
- Stack: Vite + React + TS + Tailwind + shadcn, Supabase (Lovable Cloud), ElevenLabs, Lovable AI Gateway (`openai/gpt-5`, Whisper)
- Theme: dark indigo `#0D0D2B`, coral `#C8573A`, Cormorant Garamond / DM Sans

**2. Routes & pages**
- `/` LandingPage → `/ritual`
- `/ritual` 4-step flow (Capture → Loading → Script → Audio) — `src/pages/RitualPage.tsx`
- `/login` magic link + password — `src/pages/LoginPage.tsx`
- `/my-audios` user library w/ listen count — `src/pages/MyAudiosPage.tsx`
- `/admin` admin dashboard, gated by `public.admins` table (no more `manifest2026` password)
- `/thanks`, `/create` (→ redirect to `/ritual`)

**3. Backend (Lovable Cloud / Supabase)**
- Tables with current columns + RLS summary: `submissions`, `events`, `feedback`, `admins`, `listening_log`
- `is_admin()` SECURITY DEFINER function
- Storage bucket: `manifestations` (public)
- Realtime: not enabled
- Known linter notes (intentional): public storage bucket, `is_admin` callable

**4. Edge functions** (`supabase/functions/`)
- `polish-script` — GPT-5 via Lovable AI Gateway, caches in `submissions.polished_script`
- `generate-audio` — ElevenLabs TTS, rate-limited 5/email, uploads to `manifestations` bucket
- `transcribe-audio` — Whisper via Gateway w/ OpenAI fallback
- All deploy auto via Lovable; `verify_jwt = false` default

**5. Secrets configured**
- `LOVABLE_API_KEY`, `ELEVENLABS_API_KEY` (connector-managed), Supabase keys
- Note: ElevenLabs free-tier may be blocked; user may need a paid key

**6. Auth**
- Supabase email/password + magic link; Google not yet enabled
- Admin = row in `public.admins` (user must insert their auth uid manually)

**7. Tracking / analytics**
- `trackEvent()` in `src/lib/events.ts` writes to `events` table with UTM
- See `src/lib/utm.ts`

**8. Key files for Claude Code to read first**
- `src/App.tsx` (routes)
- `src/pages/RitualPage.tsx` (core flow)
- `src/lib/auth.tsx`
- `supabase/functions/*/index.ts`
- `src/index.css` + `tailwind.config.ts` (design tokens)
- `src/integrations/supabase/client.ts` & `types.ts` (auto-generated — don't edit)

**9. Conventions / guardrails**
- Never edit `src/integrations/supabase/client.ts`, `types.ts`, or `.env`
- All DB changes via migrations
- Use semantic tokens in `index.css`, not raw colors
- Roles in `admins` table only, never on profile

**10. Open items / known issues**
- ElevenLabs free-tier abuse-detection error possible
- Google OAuth not wired
- No automated tests beyond `src/test/example.test.ts`
- Admin user must be seeded manually via SQL insert into `public.admins`

**11. How to run locally**
- `npm i && npm run dev` (port 8080)
- `.env` is auto-provided in Lovable; for local, copy from `.env.example` with real Supabase URL + publishable key

**12. Deployment**
- Frontend: Lovable auto-deploy from GitHub
- Edge functions: auto-deploy on push
- Migrations: via Lovable migration tool (not raw `supabase db push`)

That's the whole deliverable — one markdown file Claude Code can read top-to-bottom to be productive immediately. Want me to also include a short "next tasks" section, or keep it pure handover?
