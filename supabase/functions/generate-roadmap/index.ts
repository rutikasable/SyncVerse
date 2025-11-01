import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, currentKnowledge } = await req.json();
    console.log("🚀 Generating optimized roadmap for:", topic);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is missing in environment");

    // ✨ Short, brutal, 500-word version prompt
    const prompt = `
You are an expert roadmap builder. Create a short (~500 words), brutally effective, month-by-month learning roadmap for someone who wants to learn **${topic}**.

Current knowledge: ${currentKnowledge || "Beginner with no prior experience"}.

Your roadmap must:
- Be clear, structured, and practical (focus on what truly matters).
- Include 5–6 months with weekly goals.
- Emphasize **free, high-quality resources** (like docs, YouTube, or GitHub links — make them **clickable markdown links**).
- Add **1–2 realistic projects each month**.
- No fluff or motivation — go straight to the point.
- Make sure the output stays under 500 words.
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a precise learning roadmap generator. Focus on clarity, brevity, and clickable resources. Keep everything under 500 words and format cleanly for HTML rendering.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI Gateway Error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again soon." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let roadmap = data.choices?.[0]?.message?.content || "No roadmap generated.";

    // 🧠 Convert Markdown links to clickable HTML <a> tags
    roadmap = roadmap.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      `<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>`,
    );

    console.log("✅ Roadmap generated successfully");
    return new Response(
      JSON.stringify({ roadmap }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("🔥 Error generating roadmap:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate roadmap",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
