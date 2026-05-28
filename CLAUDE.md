# Claude Code — Read This First

Welcome. Before you touch anything in this repo, do these three things in order.

## 1. Read `HANDOVER.md` end-to-end

It's the source of truth for product scope, routes, schema, edge functions, secrets, conventions, and known gaps. Don't re-discover what's already documented there.

## 2. Never edit these files

They are auto-generated and managed by Lovable. Local edits will be overwritten on the next sync and can break the live app:

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `.env`

If you need a new Supabase table, column, policy, or function, write a migration under `supabase/migrations/` — don't edit `types.ts` by hand. The types regenerate from the live schema.

## 3. Respect the sync loop

This repo is bidirectionally synced with Lovable:

- Your `git push` → Lovable auto-pulls into preview + published app.
- The user's edits in Lovable → Lovable pushes commits here → you `git pull`.

Always `git pull` before starting a session. Commit small, push often, so the user's Lovable preview stays in sync with your work.

## Stack quick reference

- Vite + React 18 + TypeScript + Tailwind + shadcn/ui
- Backend: Lovable Cloud (managed Supabase) — Postgres, Auth, Storage, Edge Functions
- AI: Lovable AI Gateway (`openai/gpt-5`, Whisper) + ElevenLabs TTS
- Theme: dark indigo `#0D0D2B`, coral `#C8573A`, Cormorant Garamond + DM Sans
- Dev: `npm i && npm run dev` → http://localhost:8080
- Published: https://vista-genesis-ai.lovable.app

## Conventions (also in HANDOVER §9)

- All schema changes via migration files in `supabase/migrations/`
- Roles live in `public.admins` only — never on a profile/users table
- Use Tailwind semantic tokens (`bg-background`, `text-foreground`) — never raw hex in components
- One `supabase/config.toml`; don't add per-function blocks unless required

## What you can't do from a local clone

- Apply DB migrations to Lovable Cloud (no service-role key locally)
- Manually deploy edge functions (they auto-deploy on `git push` — just commit)
- Query as admin (no service-role key)

If you need those, ask the user to grant backend access (service-role key + ElevenLabs key as local env vars).

---

Now go read `HANDOVER.md`.
