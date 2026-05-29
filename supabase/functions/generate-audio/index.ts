const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah
const FREE_ANON_AUDIOS_PER_EMAIL = 1;            // free generations before sign-in is required

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { script, submission_id, voice_id } = await req.json();
    if (!script || typeof script !== "string") return json({ error: "script is required" }, 400);
    if (!submission_id || typeof submission_id !== "string") return json({ error: "submission_id is required" }, 400);

    // Cap script length before the (per-character billed) TTS call. A real
    // 8–12 line script is well under this; the edit box lets users paste anything.
    const MAX_SCRIPT_CHARS = 5000;
    if (script.length > MAX_SCRIPT_CHARS) return json({ error: "Script is too long." }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const ELEVEN_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVEN_KEY) throw new Error("ELEVENLABS_API_KEY not configured");

    const svc = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

    // fire-and-forget funnel event (events columns: event_name, page, submission_id)
    const logEvent = (event_name: string) =>
      fetch(`${SUPABASE_URL}/rest/v1/events`, {
        method: "POST",
        headers: { ...svc, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ event_name, page: "ritual", submission_id }),
      }).catch(() => {});

    // ── Identity (optional): validate the caller's token if one was sent ──
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && !authHeader.includes(SERVICE_KEY)) {
      const u = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { apikey: ANON_KEY, Authorization: authHeader },
      });
      if (u.ok) userId = (await u.json())?.id ?? null;
    }

    // ── Verify submission exists / not already generated ──
    const verify = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}&select=id,email,audio_url,status,user_id`,
      { headers: svc },
    );
    const rows = await verify.json();
    if (!Array.isArray(rows) || rows.length === 0) return json({ error: "Invalid submission" }, 403);
    const submission = rows[0];
    if (submission.audio_url) return json({ audio_url: submission.audio_url, cached: true });

    // ── Gate ──
    if (userId) {
      // Signed in: must have a credit. Pre-check now, decrement only after success (no refund needed).
      const c = await fetch(`${SUPABASE_URL}/rest/v1/user_credits?user_id=eq.${userId}&select=balance`, { headers: svc });
      const cr = await c.json();
      const balance = Array.isArray(cr) && cr[0] ? cr[0].balance : 0;
      if (balance < 1) {
        await logEvent("audio_blocked_no_credits");
        return json({ error: "out_of_credits", message: "You're out of credits.", scriptPreserved: true }, 402);
      }
    } else {
      // Anonymous: first audio per email is free; after that, sign-in is required.
      const count = await fetch(
        `${SUPABASE_URL}/rest/v1/submissions?email=eq.${encodeURIComponent(submission.email)}&audio_url=not.is.null&select=id`,
        { headers: { ...svc, Prefer: "count=exact" } },
      );
      const range = count.headers.get("content-range");
      const used = range ? parseInt(range.split("/")[1] || "0", 10) : 0;
      if (used >= FREE_ANON_AUDIOS_PER_EMAIL) {
        await logEvent("audio_blocked_sign_in");
        return json(
          { error: "sign_in_required", message: "You've used your free audio. Sign in to create more.", scriptPreserved: true },
          401,
        );
      }
    }

    // ── Generate audio (graceful failure: script is already saved on the submission row) ──
    const voiceId = voice_id || DEFAULT_VOICE_ID;
    let audioBytes: Uint8Array;
    try {
      const tts = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": ELEVEN_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.65, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true, speed: 0.92 },
        }),
      });
      if (!tts.ok) {
        const detail = await tts.text().catch(() => "");
        console.error("ElevenLabs error:", tts.status, detail);
        await logEvent("audio_failed");
        // 401/429 = our key blocked / rate-limited (e.g. free-tier abuse). Tell the client to retry.
        return json(
          {
            error: "audio_generation_failed",
            message: "Audio generation is temporarily unavailable. Your script is saved — please try again.",
            scriptPreserved: true,
            retryable: true,
          },
          tts.status === 401 || tts.status === 429 ? 503 : 502,
        );
      }
      audioBytes = new Uint8Array(await tts.arrayBuffer());
    } catch (e) {
      console.error("TTS network error:", e);
      await logEvent("audio_failed");
      return json(
        { error: "audio_generation_failed", message: "Something went wrong. Your script is saved — please try again.", scriptPreserved: true, retryable: true },
        502,
      );
    }

    // ── Upload to the public `manifestations` bucket ──
    const filename = `audio/manifestation-${submission_id}-${Date.now()}.mp3`;
    const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/manifestations/${filename}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "audio/mpeg", "x-upsert": "true" },
      body: audioBytes,
    });
    if (!upload.ok) {
      console.error("Upload error:", upload.status, await upload.text().catch(() => ""));
      await logEvent("audio_failed");
      return json({ error: "audio_generation_failed", message: "Could not save your audio. Please try again.", scriptPreserved: true, retryable: true }, 502);
    }
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/manifestations/${filename}`;

    // ── Success: charge a credit (signed-in only), then persist + adopt user_id ──
    let creditsRemaining: number | null = null;
    if (userId) {
      const consume = await fetch(`${SUPABASE_URL}/rest/v1/rpc/consume_credit`, {
        method: "POST",
        headers: { ...svc, "Content-Type": "application/json" },
        body: JSON.stringify({ p_user_id: userId }),
      });
      creditsRemaining = consume.ok ? await consume.json() : null;
    }

    const patch: Record<string, unknown> = { audio_url: publicUrl, audio_file_path: filename, status: "ready" };
    if (userId && !submission.user_id) patch.user_id = userId; // claim anonymous submission on first signed-in gen
    await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}`, {
      method: "PATCH",
      headers: { ...svc, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    });

    await logEvent("audio_generated");
    return json({ audio_url: publicUrl, path: filename, creditsRemaining });
  } catch (e) {
    console.error("generate-audio error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
