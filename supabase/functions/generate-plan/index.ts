// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an elite strength & conditioning coach. Generate a personalised weekly gym workout split.

RULES:
- Use ONLY equipment the user confirmed available.
- Tailor to the user's goal, age, height, weight.
- Include rest days as entries with empty exercises array and focus "Rest / Active Recovery".
- Match the requested number of training days exactly within a 7-day week.
- For each exercise, provide a sharp one-line technique cue.
- Reps as string (e.g. "8-10"), rest as string (e.g. "90s").

You MUST call the return_workout_plan function with the structured plan. Do not respond in plain text.`;

    const planNumber = Number(profile.planNumber ?? 1);
    const progression = planNumber > 1
      ? `\n\nThis is plan #${planNumber} for this user — they have completed ${planNumber - 1} prior 8-week block(s). Make this plan more advanced than a beginner block: increase intensity (heavier loading schemes, lower reps on key compounds, intensity techniques like drop sets / rest-pause / tempo work where appropriate), introduce greater exercise variety (rotate primary lifts, add unilateral and accessory variations they likely haven't seen), and progress total weekly volume sensibly.`
      : "";

    const userPrompt = `User profile:
Name: ${profile.name}
Age: ${profile.age}
Height: ${profile.height}
Weight: ${profile.weight}
Goal: ${profile.goal}
Training days per week: ${profile.daysPerWeek}
Suggested split: ${profile.suggestedSplit}
Available equipment: ${profile.equipment.join(", ")}
Plan number: ${planNumber}${progression}`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "return_workout_plan",
              description: "Return the structured weekly workout plan.",
              parameters: {
                type: "object",
                properties: {
                  split_name: { type: "string" },
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day_number: { type: "number" },
                        focus: { type: "string" },
                        exercises: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              sets: { type: "number" },
                              reps: { type: "string" },
                              rest: { type: "string" },
                              tip: { type: "string" },
                            },
                            required: ["name", "sets", "reps", "rest", "tip"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["day_number", "focus", "exercises"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["split_name", "days"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_workout_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");
    const plan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
