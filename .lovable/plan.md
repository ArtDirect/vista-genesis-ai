# Give Claude Code local access to this project

No code changes — this is a setup checklist you run once. Claude Code then clones the repo, runs it locally, and talks to the same Lovable Cloud backend.

## 1. Make the GitHub repo reachable

The repo `ArtDirect/vista-genesis-ai` is currently private (404 unauthenticated). Pick one:

- **Recommended — invite as collaborator:** GitHub → repo → Settings → Collaborators → add the GitHub username that Claude Code will use. Keeps the repo private.
- **Or make public:** repo → Settings → General → Danger Zone → Change visibility → Public. Easiest, but anyone can read the code (no secrets are committed, so this is safe — `.env` is gitignored).

## 2. Clone + install locally (Claude Code runs these)

```sh
git clone git@github.com:ArtDirect/vista-genesis-ai.git
cd vista-genesis-ai
npm i
```

## 3. Provide the two frontend env vars

The repo has `.env.example`. Create a local `.env` with the Lovable Cloud publishable values (safe to share, already in the client bundle):

```
VITE_SUPABASE_URL=https://ydakiibqaciinvxjbezy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYWtpaWJxYWNpaW52eGpiZXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzQ5NzAsImV4cCI6MjA4ODcxMDk3MH0.bUwZ0lEDLyMT37T__0VP3WwW5xQv8z85SkgyQpIqxAc
VITE_SUPABASE_PROJECT_ID=ydakiibqaciinvxjbezy
```

Then `npm run dev` → localhost:8080, talking to the live Lovable Cloud backend.

## 4. Two-way sync expectations

- Claude Code pushes to GitHub → Lovable auto-pulls into the preview/published app.
- You edit in Lovable → Lovable pushes to GitHub → Claude Code pulls.
- **Do not** let Claude Code edit `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, or `.env` — those are Lovable-managed and will get clobbered on next sync. `HANDOVER.md` already calls this out.

## 5. What Claude Code cannot do from local

Local access lets it edit code and run the frontend. It **cannot** from a local clone:

- Apply DB migrations to Lovable Cloud (no service-role key in scope #1)
- Deploy edge functions (they auto-deploy via GitHub push — so this works, just via commit, not via `supabase functions deploy`)
- Read/write `events`, `submissions`, etc. as admin

If you later want Claude Code to do those things too, come back and we'll switch to the "Full backend access" path (service-role key + ElevenLabs key as local env vars).

## 6. Point Claude Code at `HANDOVER.md` first

Tell it: *"Read `HANDOVER.md` end-to-end before touching anything."* That doc already has the schema, routes, edge-function contracts, and guardrails — it'll save a full discovery pass.

---

That's the whole setup. Want me to also draft a short `CLAUDE.md` at the repo root with the "read HANDOVER first + don't touch these files" instructions baked in, so Claude Code picks it up automatically?
