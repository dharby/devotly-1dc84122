import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Model configuration - read from environment variable, fallback to default
const MODEL = Deno.env.get("AI_MODEL") || "gemini-3.5-flash";
const REQUEST_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callAIWithRetry(body: unknown, attempt = 0): Promise<Response> {
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY not configured");

  const response = await fetchWithTimeout(AI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GOOGLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, REQUEST_TIMEOUT_MS);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    if (response.status === 402) {
      throw new Error("CREDITS_EXHAUSTED");
    }
    if (response.status >= 500 && attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      return callAIWithRetry(body, attempt + 1);
    }
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    throw new Error("AI_GATEWAY_ERROR");
  }
  
  return response;
}

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

    const response = await callAIWithRetry({
      model: MODEL,
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
    });

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content ?? "";
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      let clean = raw;
      // Strip any remaining markdown code fences
      clean = clean.replace(/```json/gi, "").replace(/```/g, "");
      // Try to find JSON object boundaries
      let start = clean.indexOf("{");
      let end = clean.lastIndexOf("}");
      if (start === -1) {
        // Try searching for { after newlines
        const lines = clean.split("\n");
        for (const line of lines) {
          const idx = line.indexOf("{");
          if (idx !== -1) { start = idx; break; }
        }
      }
      if (end === -1) {
        const lines = clean.split("\n").reverse();
        for (const line of lines) {
          const idx = line.lastIndexOf("}");
          if (idx !== -1) { end = idx; break; }
        }
      }
      if (start !== -1 && end > start) {
        try {
          parsed = JSON.parse(raw.slice(start, end + 1));
        } catch {
          parsed = { summary: "", results: [] };
        }
      } else {
        parsed = { summary: "", results: [] };
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("find-scripture error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    
    if (message === "RATE_LIMITED") {
      return new Response(JSON.stringify({ error: "Too many requests right now — please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message === "CREDITS_EXHAUSTED") {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message === "AI_GATEWAY_ERROR") {
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message.includes("timeout") || message.includes("abort")) {
      return new Response(JSON.stringify({ error: "Request timed out. Please try again." }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});