import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Today's date is ${date}. Produce the Word of the Day and the Scripture of the Day for a Christian devotional app.

Rules:
- Choose ONE meaningful biblical word (English) for the day, with its original Greek or Hebrew term, transliteration, and a short plain-English meaning (max 45 words).
- Choose ONE scripture verse for the day (different reference from the word's verse if possible). Quote the verse accurately in the ${translation} translation.
- Add a one-sentence reflection for the scripture and a one-sentence application prompt for the word.
- Vary your choices by date; do not always pick "agape" or John 3:16.

Return ONLY valid JSON, no markdown fences, in exactly this shape:
{"word":{"word":"","original":"","transliteration":"","meaning":"","reference":"","verse":"","application":""},"scripture":{"reference":"","text":"","translation":"${translation}","reflection":""}}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a careful Bible scholar. You always return strict JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (response.status === 429 || response.status === 402) {
      return new Response(JSON.stringify({ error: "AI temporarily unavailable" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) throw new Error(`AI gateway error ${response.status}`);

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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
