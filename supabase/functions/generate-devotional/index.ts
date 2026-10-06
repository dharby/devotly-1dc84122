import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Model configuration - read from Supabase config.toml, fallback to environment, fallback to default
const MODEL = Deno.env.get("AI_MODEL") || "gemini-3.5-flash";
const REQUEST_TIMEOUT_MS = 120000;
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
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not configured");

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
    const { topic, tone, translation = "ESV", compareTranslations = [] } = await req.json();
    const extras: string[] = Array.isArray(compareTranslations) ? compareTranslations.filter((t: unknown) => typeof t === "string" && t !== translation) : [];

    const systemPrompt = `You are a deeply spiritual, Bible-grounded devotional writer. You create extensive, rich devotionals that touch hearts and minds. Your writing is warm, relatable, and deeply insightful.

When generating a devotional, you MUST return valid JSON with this exact structure:
{
  "title": "A compelling, meaningful title",
  "scripture": "The full Bible verse text quoted accurately in the ${translation} translation",
  "scriptureReference": "Book Chapter:Verse (${translation})",
  "translations": [{"version": "KJV", "text": "the same verse rendered in that translation"}],
  "greekLatinInsights": "Detailed analysis of 2-3 key Greek/Hebrew/Latin words from the scripture. Include the original word, transliteration, pronunciation guide, and deep meaning. Connect each word to the broader theological concept.",
  "reflection": "An extensive reflection (at least 5-6 paragraphs) that includes:\\n- Deep theological insights\\n- Real-life relatable stories and examples\\n- Cross-references to at least 3-4 other Bible passages (include full verse text)\\n- Historical and cultural context\\n- Practical application for daily life\\n- Emotional connection and encouragement",
  "prayer": "A heartfelt, detailed prayer (at least 3 paragraphs) that covers thanksgiving, petition, and surrender",
  "declaration": "A powerful faith declaration (2-3 sentences) the reader can speak aloud"
}

TONE GUIDELINES:
- "personal": Intimate, first-person, introspective. Speak directly to the reader's heart.
- "family": Include family discussion questions, activities, and group prayer. Reference family dynamics.
- "encouraging": Extra uplifting, hope-filled, with emphasis on God's promises and faithfulness.
- "deep": Academic depth, extensive cross-references, theological analysis, word studies.

TRANSLATION RULES:
- Quote the main scripture in the ${translation} translation and never mix translations inside one quotation.
- "translations" must contain exactly these additional versions: ${extras.length ? extras.join(", ") : "none — return an empty array"}. Quote the SAME verse reference in each, as accurately as you can.
- Any verses cited inside the reflection should also use ${translation} unless you explicitly name another version.

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no extra text.`;

    const userPrompt = `Generate an extensive devotional on the topic of "${topic}" with a "${tone}" tone, using the ${translation} Bible translation${extras.length ? ` and also providing the main verse in: ${extras.join(", ")}` : ""}. Make it deeply insightful with multiple scripture references, relatable stories, Greek/Latin word analysis, and practical life application.`;

    const response = await callAIWithRetry({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    let devotional;
    try {
      devotional = JSON.parse(content);
    } catch {
      let clean = content;
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
          devotional = JSON.parse(content.slice(start, end + 1));
        } catch {
          // Last resort: extract key fields manually
          devotional = {
            title: "",
            scripture: "",
            scriptureReference: "",
            translations: [],
            greekLatinInsights: "",
            reflection: "",
            prayer: "",
            declaration: ""
          };
        }
      } else {
        throw new Error("AI returned unparseable content. Please try again with a different topic.");
      }
    }

    return new Response(JSON.stringify(devotional), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-devotional error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    
    if (message === "RATE_LIMITED") {
      return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message === "CREDITS_EXHAUSTED") {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message === "AI_GATEWAY_ERROR") {
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message.includes("timeout") || message.includes("abort")) {
      return new Response(JSON.stringify({ error: "Request timed out. Please try again with a simpler topic." }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
