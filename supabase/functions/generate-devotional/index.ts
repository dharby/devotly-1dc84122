import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, tone, translation = "ESV", compareTranslations = [] } = await req.json();
    const extras: string[] = Array.isArray(compareTranslations) ? compareTranslations.filter((t: unknown) => typeof t === "string" && t !== translation) : [];
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean potential markdown wrapping
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    const devotional = JSON.parse(content);

    return new Response(JSON.stringify(devotional), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-devotional error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
