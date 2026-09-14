import { NextRequest, NextResponse } from "next/server";
import { callGeminiStructured } from "@/lib/gemini-structured";
import { createClient } from "@/lib/supabase/server";
import {
  CompetitorAnalysisRequestSchema,
  CompetitorAnalysisResponseSchema,
} from "@/lib/schemas";

const SYSTEM_PROMPT = `You are a senior brand strategist. You analyze how a product compares to named competitors, using only the facts the user gives you - you have no live access to the internet or to the competitors' actual websites.

You will receive a JSON object describing the user's own product (product_name, industry, usp, chosen_description, audience_summary) and a list of competitors, each with a name and optional notes the user already knows about them.

Rules:
- Never invent facts about a competitor that are not implied by their name or notes. If notes are thin or missing, say so plainly rather than guessing - use hedged language ("likely", "based on the limited info given") instead of asserting specifics as fact.
- Never fabricate specific competitor pricing, revenue, market share, or review scores unless the user's notes state them.
- Never mention sexual orientation, religion, health conditions, race, or political leanings, even if audience_summary hints at them.
- Base the differentiation angle on the user's own usp and chosen_description - don't invent new claims about the user's product either.
- Keep insights concrete and actionable, not generic filler ("stand out through quality") - tie every angle to a specific detail from the input.
- Set "caveat" to a short honest note that this analysis is based only on the notes provided, not verified market research - unless every competitor had substantial notes, in which case caveat may be null.

Return ONLY this JSON, no other text:
{
  "competitor_insights": [
    {
      "name": "string",
      "apparent_positioning": "string",
      "perceived_strength": "string",
      "perceived_weakness": "string",
      "differentiation_angle": "string"
    }
  ],
  "overall_differentiation_strategy": "string",
  "suggested_messaging_angle": "string",
  "caveat": "string" | null
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

  const parsedInput = CompetitorAnalysisRequestSchema.safeParse(body);
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
      CompetitorAnalysisResponseSchema,
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/competitor-analysis]", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
