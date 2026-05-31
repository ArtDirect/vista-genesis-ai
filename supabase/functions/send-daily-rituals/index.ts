// Triggered once a day by a pg_cron job (which sends the x-cron-secret header).
// Sends each subscribed email their latest ritual as a gentle morning reminder.
// NOT a user-facing endpoint — the secret check stops anyone from blasting emails.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function hmac(email: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(email.toLowerCase()));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function reminderHtml(opts: { script: string; audioUrl: string; unsubUrl: string }) {
  const scriptLines = escapeHtml(opts.script)
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => `<p style="margin:0 0 10px;font-style:italic;font-size:17px;line-height:1.8;color:#1a1a2e;">${l}</p>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f2ee;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:20px;overflow:hidden;">
        <tr><td style="padding:36px 36px 8px;text-align:center;">
          <p style="margin:0;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#C8573A;">Good morning</p>
          <h1 style="margin:12px 0 0;font-size:26px;font-weight:400;color:#0D0D2B;font-style:italic;">Take a moment with your future.</h1>
        </td></tr>
        <tr><td style="padding:24px 36px;">${scriptLines}</td></tr>
        <tr><td style="padding:8px 36px 32px;text-align:center;">
          <a href="${opts.audioUrl}" style="display:inline-block;background:#C8573A;color:#fff;text-decoration:none;font-size:15px;font-weight:500;padding:14px 32px;border-radius:999px;">Listen now</a>
        </td></tr>
        <tr><td style="padding:0 36px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#999;">You're getting this because you saved a ritual.
            <a href="${opts.unsubUrl}" style="color:#999;">Unsubscribe</a>.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  // ── Auth: only the cron job (with the shared secret) may trigger this ──
  const CRON_SECRET = Deno.env.get("CRON_SECRET");
  if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY not set" }, 500);
    const from = Deno.env.get("RESEND_FROM") || "ManifestFlow <onboarding@resend.dev>";
    const UNSUB_SECRET = Deno.env.get("UNSUB_SECRET") || SERVICE_KEY;
    const svc = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

    // Subscribed addresses not already reminded in the last ~20h (guards against
    // an accidental double-trigger sending twice in one day).
    const cutoff = new Date(Date.now() - 20 * 3600 * 1000).toISOString();
    const prefsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/email_preferences?reminders_enabled=eq.true&or=(last_reminder_at.is.null,last_reminder_at.lt.${cutoff})&select=email&limit=500`,
      { headers: svc },
    );
    const prefs = await prefsRes.json();
    if (!Array.isArray(prefs)) return json({ error: "Could not read preferences" }, 500);

    let sent = 0, skipped = 0, failed = 0;
    for (const { email } of prefs) {
      // This address's most recent ritual that actually has audio.
      const sRes = await fetch(
        `${SUPABASE_URL}/rest/v1/submissions?email=eq.${encodeURIComponent(email)}&audio_url=not.is.null&select=audio_url,audio_script,polished_script&order=created_at.desc&limit=1`,
        { headers: svc },
      );
      const subs = await sRes.json();
      if (!Array.isArray(subs) || subs.length === 0) { skipped++; continue; }
      const sub = subs[0];
      const script = sub.audio_script || sub.polished_script || "";
      const token = await hmac(email, UNSUB_SECRET);
      const unsubUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: email,
          subject: "Your morning ritual",
          html: reminderHtml({ script, audioUrl: sub.audio_url, unsubUrl }),
        }),
      });

      if (r.ok) {
        sent++;
        await fetch(`${SUPABASE_URL}/rest/v1/email_preferences?email=eq.${encodeURIComponent(email)}`, {
          method: "PATCH",
          headers: { ...svc, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ last_reminder_at: new Date().toISOString() }),
        });
      } else {
        failed++;
        console.error("Resend error for", email, r.status, await r.text().catch(() => ""));
      }
    }

    return json({ ok: true, sent, skipped, failed, considered: prefs.length });
  } catch (e) {
    console.error("send-daily-rituals error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
