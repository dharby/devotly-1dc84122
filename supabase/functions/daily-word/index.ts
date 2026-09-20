import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const AI_MODEL = "gemini-3.6-flash";
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
    const body = await req.json().catch(() => ({}));
    const date: string = typeof body?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : new Date().toISOString().slice(0, 10);
    const translation: string = typeof body?.translation === "string" && body.translation.length <= 10
      ? body.translation
      : "ESV";

    const prompt = `Today's date is ${date}. Produce the Word of the Day and the Scripture of the Day for a Christian devotional app.

Rules:
- Choose ONE meaningful biblical word (English) for the day, with its original Greek or Hebrew term, transliteration, and a short plain-English meaning (max 45 words).
- Choose ONE scripture verse for the day (different reference from the word's verse if possible). Quote the verse accurately in the ${translation} translation.
- Add a one-sentence reflection for the scripture and a one-sentence application prompt for the word.
- Vary your choices by date; do not always pick "agape" or John 3:16.

Return ONLY valid JSON, no markdown fences, in exactly this shape:
{"word":{"word":"","original":"","transliteration":"","meaning":"","reference":"","verse":"","application":""},"scripture":{"reference":"","text":"","translation":"${translation}","reflection":""}}`;

    const response = await callAIWithRetry({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "You are a careful Bible scholar. You always return strict JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const parsed = JSON.parse(cleaned.slice(start, end + 1));

    return new Response(JSON.stringify({ date, ...parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-word error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    
    if (message === "RATE_LIMITED") {
      return new Response(JSON.stringify({ error: "AI temporarily unavailable" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message === "CREDITS_EXHAUSTED") {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message === "AI_GATEWAY_ERROR") {
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message.includes("timeout") || message.includes("abort")) {
      return new Response(JSON.stringify({ error: "Request timed out" }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});