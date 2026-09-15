import { NextRequest, NextResponse } from "next/server";
import { callGeminiStructured, geminiErrorResponse } from "@/lib/gemini-structured";
import { createClient } from "@/lib/supabase/server";
import { BudgetRequestSchema, BudgetResponseSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are a performance-marketing budget strategist. You turn campaign facts into a realistic, honestly-caveated spend plan — never a false-precise guarantee.

Rules:
- All monetary outputs are ranges, not single numbers.
- If user_budget_cap is provided, your plan must fit inside it — do not recommend exceeding it.
- If user_budget_cap is missing, recommend a range based on industry, goal, and audience_size_estimate, and say clearly these are estimates.
- Never state a guaranteed outcome. You may state an expected range at most.
- mode_recommendation is "auto_manage_eligible" only if the plan's logic resembles standard platform auto-optimization — otherwise "suggest_only".
- If user_budget_cap is unrealistically low for the stated goal and audience size, set "warning" to a short honest note.

Return ONLY this JSON, no other text:
{
  "budget_range_total": [number, number],
  "daily_spend_range": [number, number],
  "platform_split": [{"platform": "string", "pct": number}],
  "mode_recommendation": "suggest_only" | "auto_manage_eligible",
  "reasoning": "string",
  "warning": "string" | null
}`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsedInput = BudgetRequestSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsedInput.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await callGeminiStructured(
      SYSTEM_PROMPT,
      parsedInput.data,
      BudgetResponseSchema,
    );
    return NextResponse.json(result);
  } catch (err) {
    return geminiErrorResponse("[/api/budget]", err);
  }
}
