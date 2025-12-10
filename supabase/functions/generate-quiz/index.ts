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
    const { topic, difficulty = "medium", numQuestions = 5, language = "english" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert quiz generator for educational purposes. Generate exactly ${numQuestions} multiple-choice questions about "${topic}" at ${difficulty} difficulty level. 
    
    Return ONLY a valid JSON array with this exact structure:
    [
      {
        "question_text": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "The correct option text exactly as in options",
        "explanation": "Brief explanation of why this is correct",
        "topic": "Subtopic this question covers"
      }
    ]
    
    Language for questions and answers: ${language}
    Make sure questions progress from basic to more advanced concepts.`;

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
          { role: "user", content: `Generate a quiz about: ${topic}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate quiz");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid quiz format received");
    }
    
    const questions = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
