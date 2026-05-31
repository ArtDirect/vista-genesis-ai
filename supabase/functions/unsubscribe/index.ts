// Public GET endpoint hit from the unsubscribe link in reminder emails.
// The link carries an HMAC token over the email, so only links we generated work
// — nobody can unsubscribe an arbitrary address by guessing the URL.

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

const page = (title: string, body: string) =>
  new Response(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
    <body style="margin:0;font-family:system-ui,sans-serif;background:#f4f2ee;display:flex;min-height:100vh;align-items:center;justify-content:center;">
      <div style="max-width:420px;background:#fff;border-radius:20px;padding:40px;text-align:center;">
        <h1 style="font-size:22px;font-weight:400;color:#0D0D2B;margin:0 0 12px;">${title}</h1>
        <p style="font-size:15px;color:#555;line-height:1.6;margin:0;">${body}</p>
      </div>
    </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } },
  );

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").trim();
    const token = url.searchParams.get("token") || "";
    if (!email || !token) return page("Invalid link", "This unsubscribe link is missing information.");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const UNSUB_SECRET = Deno.env.get("UNSUB_SECRET") || SERVICE_KEY;

    const expected = await hmac(email, UNSUB_SECRET);
    if (token !== expected) return page("Invalid link", "This unsubscribe link is not valid.");

    const svc = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
    // Upsert so it works even if the email isn't in the table yet.
    await fetch(`${SUPABASE_URL}/rest/v1/email_preferences`, {
      method: "POST",
      headers: { ...svc, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ email, reminders_enabled: false }),
    });

    return page("You're unsubscribed", "You won't receive any more daily ritual reminders. You can still create new rituals anytime.");
  } catch (e) {
    console.error("unsubscribe error:", e);
    return page("Something went wrong", "Please try again later.");
  }
});
