const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Build the "your ritual is ready" email. Calm, minimal, light-background
// (email clients render dark backgrounds inconsistently).
function ritualEmailHtml(opts: { script: string; audioUrl: string | null; appUrl: string }) {
  const scriptLines = escapeHtml(opts.script)
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => `<p style="margin:0 0 10px;font-style:italic;font-size:17px;line-height:1.8;color:#1a1a2e;">${l}</p>`)
    .join("");

  const listenButton = opts.audioUrl
    ? `<a href="${opts.audioUrl}" style="display:inline-block;background:#C8573A;color:#fff;text-decoration:none;font-size:15px;font-weight:500;padding:14px 32px;border-radius:999px;">Listen to your ritual</a>`
    : "";

  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f2ee;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;">
        <tr><td style="padding:36px 36px 8px;text-align:center;">
          <p style="margin:0;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#C8573A;">Your ritual is ready</p>
          <h1 style="margin:12px 0 0;font-size:28px;font-weight:400;color:#0D0D2B;font-style:italic;">It's yours.</h1>
        </td></tr>
        <tr><td style="padding:24px 36px;">
          ${scriptLines}
        </td></tr>
        <tr><td style="padding:8px 36px 32px;text-align:center;">
          ${listenButton}
        </td></tr>
        <tr><td style="padding:0 36px 36px;text-align:center;">
          <p style="margin:0 0 6px;font-size:14px;color:#555;">Listen every morning. Let your future settle into your body.</p>
          <p style="margin:16px 0 0;font-size:13px;color:#888;">Want to keep all your rituals and build a daily streak?
            <a href="${opts.appUrl}/login" style="color:#C8573A;">Create a free account</a>.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Anonymous clients can't UPDATE submissions (RLS), so the payoff-screen
// "save my ritual" step routes through this service-role function. After saving
// the email, it sends the ritual to that inbox (best-effort — a send failure
// never fails the save).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { submission_id, email } = await req.json();
    if (!submission_id || typeof submission_id !== "string") return json({ error: "submission_id is required" }, 400);
    if (!email || typeof email !== "string") return json({ error: "email is required" }, 400);

    const clean = email.trim();
    // Lightweight format + length guard (not full RFC validation; just sane bounds).
    if (clean.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      return json({ error: "Please enter a valid email." }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

    // Verify the submission exists; read current email + the audio/script for the email body.
    const verify = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}&select=id,email,audio_url,audio_script,polished_script`,
      { headers: svc },
    );
    const rows = await verify.json();
    if (!Array.isArray(rows) || rows.length === 0) return json({ error: "Invalid submission" }, 403);
    const submission = rows[0];

    // First-write-wins: only set the email if it isn't already set. This stops
    // a caller from overwriting the email on a submission they don't own, and
    // caps this to one ritual email per submission.
    if (submission.email) return json({ ok: true, alreadySet: true });

    await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}`, {
      method: "PATCH",
      headers: { ...svc, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email: clean }),
    });

    // ── Send the ritual email (best-effort) ──
    let emailSent = false;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
        const from = Deno.env.get("RESEND_FROM") || "ManifestFlow <onboarding@resend.dev>";
        const appUrl = Deno.env.get("APP_URL") || "https://vista-genesis-ai.lovable.app";
        const script = submission.audio_script || submission.polished_script || "";
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: clean,
            subject: "Your ritual is ready",
            html: ritualEmailHtml({ script, audioUrl: submission.audio_url, appUrl }),
          }),
        });
        emailSent = res.ok;
        if (!res.ok) console.error("Resend error:", res.status, await res.text().catch(() => ""));
      } catch (e) {
        console.error("Resend send failed:", e);
      }
    } else {
      console.warn("RESEND_API_KEY not set — email saved but not sent.");
    }

    return json({ ok: true, emailSent });
  } catch (e) {
    console.error("save-email error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
