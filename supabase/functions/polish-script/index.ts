const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { dream, submission_id } = await req.json();
    if (!dream || typeof dream !== "string") {
      return new Response(JSON.stringify({ error: "dream is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!submission_id || typeof submission_id !== "string") {
      return new Response(JSON.stringify({ error: "submission_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap input length: a genuine dream is a few sentences. This stops a
    // crafted oversized payload from running up GPT token costs.
    const MAX_DREAM_CHARS = 5000;
    if (dream.length > MAX_DREAM_CHARS) {
      return new Response(JSON.stringify({ error: "Dream is too long." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Verify the submission exists ──
    const verifyResp = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}&select=id,polished_script`,
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

    // Return cached script if already polished
    if (rows[0].polished_script) {
      return new Response(JSON.stringify({ script: rows[0].polished_script, cached: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Generate polished script ──
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You transform a person's raw dream description into a polished manifestation script.

Rules:
- First-person, present tense ("I am...", "I choose...", "I feel...")
- 8-12 short lines, each on its own line
- Emotionally resonant but grounded and believable
- NEVER use: "guaranteed", "the universe will", "manifest", "abundance flows", clichés
- Use sensory, specific language tied to the user's actual dream
- Open with a grounding line ("I am here. I am ready.")
- Close with a quiet, certain line

Output ONLY the script lines. No headers, no explanation, no quotes.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Dream:\n${dream}` },
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const script = data.choices?.[0]?.message?.content?.trim() || "";

    // ── Update submission with polished script ──
    await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submission_id}`, {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ polished_script: script, raw_text: dream }),
    });

    return new Response(JSON.stringify({ script }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("polish-script error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
