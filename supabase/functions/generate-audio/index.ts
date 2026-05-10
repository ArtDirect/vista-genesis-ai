const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah
const MAX_GENERATIONS_PER_EMAIL = 5; // Rate limit: max audio generations per email address

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { script, submission_id, voice_id } = await req.json();
    if (!script || typeof script !== "string") {
      return new Response(JSON.stringify({ error: "script is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!submission_id || typeof submission_id !== "string") {
      return new Response(JSON.stringify({ error: "submission_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Verify the submission exists and hasn't already been generated ──
    const verifyResp = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}&select=id,email,audio_url,status`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    );
    const rows = await verifyResp.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid submission" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const submission = rows[0];

    // Don't regenerate if audio already exists for this submission
    if (submission.audio_url) {
      return new Response(JSON.stringify({ audio_url: submission.audio_url, cached: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Rate limit: max N audio generations per email ──
    const countResp = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?email=eq.${encodeURIComponent(submission.email)}&audio_url=not.is.null&select=id`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Prefer: "count=exact",
        },
      }
    );
    const countHeader = countResp.headers.get("content-range");
    const existingCount = countHeader ? parseInt(countHeader.split("/")[1] || "0", 10) : 0;

    if (existingCount >= MAX_GENERATIONS_PER_EMAIL) {
      return new Response(
        JSON.stringify({ error: `Rate limit: max ${MAX_GENERATIONS_PER_EMAIL} audio generations per email. Upgrade for more.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Generate audio via ElevenLabs ──
    const ELEVEN_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVEN_KEY) throw new Error("ELEVENLABS_API_KEY not configured");

    const voiceId = voice_id || DEFAULT_VOICE_ID;
    const ttsResp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
            speed: 0.92,
          },
        }),
      }
    );

    if (!ttsResp.ok) {
      const errText = await ttsResp.text();
      console.error("ElevenLabs error:", ttsResp.status, errText);
      return new Response(JSON.stringify({ error: `TTS failed: ${ttsResp.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await ttsResp.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    // ── Upload to Supabase Storage ──
    const filename = `audio/manifestation-${submission_id}-${Date.now()}.mp3`;

    const uploadResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/manifestations/${filename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "audio/mpeg",
          "x-upsert": "true",
        },
        body: audioBytes,
      }
    );

    if (!uploadResp.ok) {
      const t = await uploadResp.text();
      console.error("Upload error:", uploadResp.status, t);
      return new Response(JSON.stringify({ error: "Failed to store audio" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/manifestations/${filename}`;

    // ── Update submission row ──
    await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}`, {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ audio_url: publicUrl, audio_file_path: filename, status: "ready" }),
    });

    return new Response(JSON.stringify({ audio_url: publicUrl, path: filename }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-audio error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
