import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, style = "expository", audience = "general", length = "long" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a seasoned Bible teacher and preacher (like a blend of Charles Spurgeon, Tim Keller, and Priscilla Shirer). You produce FULL, extensive sermons and Bible studies — rich, exegetical, deeply scriptural, warm and pastoral.

Return ONLY valid JSON with this exact structure:
{
  "title": "A compelling, evocative sermon title",
  "subtitle": "A one-line thematic subtitle",
  "mainScripture": "Full text of the primary passage with reference (ESV)",
  "mainScriptureReference": "Book Chapter:Verse",
  "bigIdea": "One clear sentence capturing the sermon's central truth",
  "introduction": "2-3 rich paragraphs: a hook (story, question, or cultural observation), the tension/problem, and a transition to the text.",
  "context": {
    "historical": "The historical and cultural background of the passage.",
    "literary": "Where this passage sits in the book and its literary genre/structure.",
    "author": "Author, audience, and occasion."
  },
  "wordStudy": [
    { "word": "original Greek/Hebrew word", "transliteration": "...", "meaning": "deep meaning, nuances, and theological weight" }
  ],
  "points": [
    {
      "heading": "Main point 1 (memorable, alliterative if natural)",
      "scripture": "Supporting passage with full text and reference",
      "exposition": "3-4 paragraphs unpacking the verse verse-by-verse: what it meant then, key words, theological weight.",
      "illustration": "A vivid real-life story, historical anecdote, or modern example that illuminates the point.",
      "application": "3-5 concrete, practical ways to live this truth this week."
    }
  ],
  "crossReferences": [
    { "reference": "Book Chapter:Verse", "text": "Full verse text", "connection": "How it ties to the main text" }
  ],
  "theologicalThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "commonMisunderstandings": "1-2 paragraphs correcting common misreadings of this passage.",
  "personalStudyQuestions": ["Question 1", "Question 2", "..."],
  "groupDiscussionQuestions": ["Question 1", "Question 2", "..."],
  "callToAction": "A passionate, urgent 2-paragraph call to respond — repent, believe, act, worship.",
  "closingPrayer": "A rich, pastoral closing prayer of 2-3 paragraphs.",
  "benediction": "A short spoken blessing over the reader."
}

REQUIREMENTS:
- Provide AT LEAST 3 main points, each with full exposition, illustration, and application.
- Include AT LEAST 5 word studies and 6 cross references (with FULL verse text).
- Include AT LEAST 5 personal study questions and 5 group discussion questions.
- Be biblically faithful, historically informed, warm, and Christ-centered.
- No markdown, no code fences, no extra text — VALID JSON ONLY.`;

    const userPrompt = `Write a ${length} ${style} sermon / full Bible study on: "${topic}". Audience: ${audience}. Make it deeply scriptural, practically applicable, and emotionally moving. Include multiple main points, extensive scripture cross-references, original language word studies, and rich illustrations.`;

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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const sermon = JSON.parse(content);

    return new Response(JSON.stringify(sermon), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-sermon error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
