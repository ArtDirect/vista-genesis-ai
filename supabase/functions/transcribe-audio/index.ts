const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { audio_url, submission_id } = await req.json();
    if (!audio_url || typeof audio_url !== "string") {
      return new Response(JSON.stringify({ error: "audio_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Download the audio file from Supabase Storage
    const audioResp = await fetch(audio_url);
    if (!audioResp.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch audio: ${audioResp.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const audioBlob = await audioResp.blob();

    // 2. Send to OpenAI Whisper for transcription
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build multipart form data for Whisper API
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("model", "whisper-1");
    formData.append("language", "en");
    formData.append("response_format", "text");

    const whisperResp = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResp.ok) {
      // Fallback: try OpenAI directly if gateway doesn't support audio
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
      if (OPENAI_API_KEY) {
        const fallbackForm = new FormData();
        fallbackForm.append("file", audioBlob, "recording.webm");
        fallbackForm.append("model", "whisper-1");
        fallbackForm.append("language", "en");
        fallbackForm.append("response_format", "text");

        const fallbackResp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: fallbackForm,
        });

        if (!fallbackResp.ok) {
          const t = await fallbackResp.text();
          console.error("OpenAI Whisper fallback error:", fallbackResp.status, t);
          return new Response(JSON.stringify({ error: "Transcription failed" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const transcript = (await fallbackResp.text()).trim();
        if (submission_id) {
          await updateSubmission(submission_id, transcript);
        }
        return new Response(JSON.stringify({ transcript }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const t = await whisperResp.text();
      console.error("Gateway Whisper error:", whisperResp.status, t);
      return new Response(JSON.stringify({ error: "Transcription failed — no Whisper API available" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcript = (await whisperResp.text()).trim();

    // 3. Update the submission row with the transcript
    if (submission_id) {
      await updateSubmission(submission_id, transcript);
    }

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("transcribe-audio error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateSubmission(submissionId: string, transcript: string) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submissionId}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      transcript_text: transcript,
      raw_text: transcript,
    }),
  });
}
