import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2 || query.length > 500) {
      return new Response(JSON.stringify({ error: "Please enter a phrase or idea (2-500 characters)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY not configured");

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-3.6-flash",
        messages: [
          {
            role: "system",
            content: `You are a fast, accurate Bible reference finder. The user gives a paraphrase, a half-remembered phrase, a theme, an idea, or an exact quote. Find EVERY plausible scripture reference it could be.

Rules:
- Return the most likely match first, then other possible matches (up to 8 total).
- Include exact book, chapter and verse (or verse range).
- Give a short, faithful paraphrase / plain-English explanation of each passage.
- Include a brief KJV-style or literal quote snippet where helpful (keep under 40 words).
- Give a confidence value: "high", "medium" or "low".
- Also return a one-sentence overall summary of the idea the user is describing.

Respond with ONLY valid JSON, no markdown fences:
{"summary":"...","results":[{"reference":"John 14:27","translationSnippet":"...","paraphrase":"...","context":"...","confidence":"high","themes":["peace"]}]}`,
          },
          { role: "user", content: `Find the scripture(s) for: "${query}"` },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Too many requests right now — please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) throw new Error(`AI gateway error: ${response.status}`);

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content ?? "";
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      parsed = start >= 0 && end > start ? JSON.parse(raw.slice(start, end + 1)) : { summary: "", results: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("find-scripture error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
