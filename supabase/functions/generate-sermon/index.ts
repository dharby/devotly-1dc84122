import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, style = "expository", audience = "general", length = "long" } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not configured");

    const systemPrompt = `You are a seasoned Bible expositor and preacher (a blend of Charles Spurgeon, Tim Keller, Priscilla Shirer and Alistair Begg). You write COMPLETE, PULPIT-READY manuscripts — the kind a preacher can literally read aloud for 45 to 60 minutes — not outlines or summaries.

Write in the SPOKEN VOICE of a preacher: direct address ("Church, look at verse 4 with me..."), rhetorical questions, repetition for emphasis, pauses, callbacks to the hook, and warm pastoral tone. Every exposition paragraph should sound like it is being preached, not written as an essay.

Return ONLY valid JSON with this exact structure:
{
  "title": "A compelling, evocative sermon title",
  "subtitle": "A one-line thematic subtitle",
  "seriesNote": "One line placing this message in a larger biblical storyline",
  "estimatedDuration": "e.g. 52 minutes",
  "mainScripture": "FULL text of the primary passage, verse by verse, each verse numbered, with reference",
  "mainScriptureReference": "Book Chapter:Verse-Verse",
  "bigIdea": "One clear sentence capturing the sermon's central truth",
  "sermonInOneSentence": "The message distilled for the listener to carry home",
  "openingPrayer": "A short invocation prayer before the message (1 paragraph, spoken aloud).",
  "hook": "A gripping opening: a story, statistic, cultural observation or question, 2 paragraphs, told vividly.",
  "introduction": "3-4 rich paragraphs: name the tension/problem the listener feels, raise the stakes, and transition into the text.",
  "roadmap": ["Short preview line of point 1", "point 2", "point 3", "..."],
  "context": {
    "historical": "2 paragraphs of historical and cultural background.",
    "literary": "2 paragraphs on where this passage sits in the book, its genre and structure.",
    "author": "Author, audience, date and occasion, with detail.",
    "canonical": "How this passage fits the whole storyline of Scripture from Genesis to Revelation."
  },
  "wordStudy": [
    { "word": "original Greek/Hebrew word in original script", "transliteration": "...", "reference": "Where it appears in the text", "meaning": "Deep meaning, semantic range, other NT/OT usages, and theological weight — a full paragraph." }
  ],
  "points": [
    {
      "heading": "Main point 1 (memorable, preachable, alliterative if natural)",
      "scripture": "Supporting passage with FULL text and reference",
      "exposition": "5-7 substantial spoken paragraphs walking verse by verse: what it says, what it meant then, key words, grammar that matters, theological weight, and what it does NOT mean.",
      "illustration": "A vivid, fully told story (historical anecdote, biography, modern life, or nature) of 2 paragraphs that illuminates the point.",
      "secondIllustration": "A second, shorter image, analogy or quotation that reinforces the point.",
      "objection": "'But someone will say...' — name the honest objection or doubt a listener has here, and answer it pastorally in a paragraph.",
      "supportingVerses": [ { "reference": "Book Chapter:Verse", "text": "Full verse text" } ],
      "application": "4-6 concrete, specific, this-week applications written as spoken exhortation, not bullets.",
      "transition": "A sentence or two moving the congregation to the next point."
    }
  ],
  "crossReferences": [ { "reference": "Book Chapter:Verse", "text": "Full verse text", "connection": "How it ties to the main text" } ],
  "theologicalThemes": ["Theme 1", "Theme 2", "..."],
  "christConnection": "2 paragraphs showing how this passage points to Christ and the gospel of grace — never moralism.",
  "commonMisunderstandings": "2 paragraphs correcting common misreadings of this passage.",
  "quotes": [ { "quote": "A quotable line from a trusted Christian voice or a crafted memorable line", "source": "Attribution (say 'paraphrase' if not exact)" } ],
  "practicalSteps": [ { "day": "Day 1", "action": "A concrete step", "verse": "Book Chapter:Verse" } ],
  "memoryVerse": { "reference": "Book Chapter:Verse", "text": "Full text" },
  "personalStudyQuestions": ["Question 1", "..."],
  "groupDiscussionQuestions": ["Question 1", "..."],
  "prayerPoints": ["A specific thing to pray, 1 line", "..."],
  "worshipSuggestions": ["Hymn or worship song title — why it fits", "..."],
  "deliveryNotes": "Notes to the preacher on pacing, where to slow down, where to raise intensity, and how long each movement should take.",
  "callToAction": "A passionate, urgent 3-paragraph appeal — repent, believe, act, worship — ending with a clear invitation.",
  "closingPrayer": "A rich, pastoral closing prayer of 3 paragraphs.",
  "benediction": "A short spoken blessing over the congregation.",
  "furtherStudy": ["A book, commentary or passage for deeper study", "..."]
}

HARD REQUIREMENTS — a response that misses any of these is a failure:
- The full manuscript must be long enough to preach for 45-60 minutes: aim for 6,000-8,000 words of actual content.
- EXACTLY 4 to 5 main points, each with the full exposition, BOTH illustrations, objection, supporting verses, application and transition.
- AT LEAST 6 word studies, 8 cross references (FULL verse text), 3 quotes, 7 practical steps (a full week), 6 personal study questions, 6 group discussion questions, 6 prayer points, 4 worship suggestions, 4 further study items.
- Quote scripture in full — never say "see verse 3", write it out.
- Be biblically faithful, exegetically careful, historically informed, warm, and Christ-centered.
- No markdown, no code fences, no commentary — VALID JSON ONLY.`;

    const userPrompt = `Write a complete 45-60 minute ${style} sermon manuscript and full Bible study on: "${topic}". Audience: ${audience}. Length: ${length}.

This must be a full manuscript a preacher could stand and deliver word for word — deeply scriptural, exegetically rich, emotionally moving and practically applicable. Include the opening prayer, the hook, verse-by-verse exposition across 4-5 main points, original language word studies, extensive cross references with full verse text, illustrations, honest objections answered, the connection to Christ, a week of practical steps, the appeal, and the closing prayer and benediction.`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-3.6-flash",
        max_tokens: 32000,
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

    let sermon;
    try {
      sermon = JSON.parse(content);
    } catch {
      // Recover from a truncated or wrapped JSON payload.
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start === -1 || end <= start) throw new Error("The sermon came back malformed. Please try again.");
      sermon = JSON.parse(content.slice(start, end + 1));
    }

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
