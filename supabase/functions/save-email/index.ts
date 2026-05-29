const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Anonymous clients can't UPDATE submissions (RLS), so the payoff-screen
// "save my ritual" step routes through this service-role function.
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

    // Verify the submission exists and read its current email.
    const verify = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}&select=id,email`,
      { headers: svc },
    );
    const rows = await verify.json();
    if (!Array.isArray(rows) || rows.length === 0) return json({ error: "Invalid submission" }, 403);

    // First-write-wins: only set the email if it isn't already set. This stops
    // a caller from overwriting the email on a submission they don't own.
    if (rows[0].email) return json({ ok: true, alreadySet: true });

    await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}`, {
      method: "PATCH",
      headers: { ...svc, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email: clean }),
    });

    return json({ ok: true });
  } catch (e) {
    console.error("save-email error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
