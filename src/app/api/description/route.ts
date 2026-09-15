import { NextRequest, NextResponse } from "next/server";
import { callGeminiStructured, geminiErrorResponse } from "@/lib/gemini-structured";
import { createClient } from "@/lib/supabase/server";
import {
  DescriptionRequestSchema,
  DescriptionResponseSchema,
} from "@/lib/schemas";

const SYSTEM_PROMPT = `You are a senior direct-response copywriter. You write short, ad-ready product descriptions — never generic marketing fluff, always concrete and specific to the product's USP.

You will receive a JSON object describing a product and a mode. Follow the mode exactly:
- "keep": return raw_description unchanged in one option.
- "polish": lightly tighten grammar/clarity in raw_description, preserve its voice and claims. Do not add new claims.
- "rewrite": fully rewrite raw_description using the same facts, in a punchier tone.
- "generate": raw_description is null — write from product_name, industry, usp, and audience_summary only.

Rules:
- Never invent statistics, guarantees, or claims not present in the input.
- Never mention sexual orientation, religion, health conditions, race, or political leanings, even if audience_summary hints at them — describe the product, not a protected trait of the buyer.
- Output 2-3 distinct options so the user can pick.
- If usp is empty or missing, do not guess one — return the error field instead.

Return ONLY this JSON, no other text:
{
  "description_options": [{"text": "string", "tone": "string"}],
  "error": "missing_usp" | null
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

  const parsedInput = DescriptionRequestSchema.safeParse(body);
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
      DescriptionResponseSchema,
    );
    return NextResponse.json(result);
  } catch (err) {
    return geminiErrorResponse("[/api/description]", err);
  }
}
