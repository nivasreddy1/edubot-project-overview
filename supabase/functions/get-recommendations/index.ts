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
    const { weakTopics = [], recentQueries = [], quizPerformance = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI learning advisor. Based on the student's weak topics, recent queries, and quiz performance, provide personalized learning recommendations.

    Return ONLY a valid JSON object with this structure:
    {
      "recommendations": [
        {
          "type": "topic" | "quiz" | "revision" | "resource",
          "title": "Short recommendation title",
          "description": "Detailed recommendation",
          "priority": "high" | "medium" | "low"
        }
      ]
    }
    
    Provide 3-5 actionable recommendations.`;

    const userContext = `
    Weak Topics: ${weakTopics.join(", ") || "None identified yet"}
    Recent Queries: ${recentQueries.slice(0, 5).join(", ") || "None"}
    Quiz Performance: ${quizPerformance.length > 0 ? JSON.stringify(quizPerformance.slice(0, 5)) : "No quiz data"}
    `;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContext },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get recommendations");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid recommendations format");
    }
    
    const recommendations = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
