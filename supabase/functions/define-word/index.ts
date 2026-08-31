import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { word } = await req.json();
    if (!word || typeof word !== "string" || word.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid word" }), {
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
            content: `You are a Bible dictionary and word study tool. When given a word, provide:
1. A clear, concise definition
2. If it's a biblical/theological term, include the original Greek/Hebrew word, transliteration, and meaning
3. How it's commonly used in Scripture
4. A brief example verse reference

Keep the response under 200 words. Be clear and educational.`,
          },
          { role: "user", content: `Define the word: "${word}"` },
        ],
      }),
    });

    if (!response.ok) throw new Error("AI gateway error");

    const data = await response.json();
    const definition = data.choices?.[0]?.message?.content || "No definition found.";

    return new Response(JSON.stringify({ definition }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("define-word error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
