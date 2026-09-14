import { NextRequest, NextResponse } from "next/server";
import { callGeminiStructured } from "@/lib/gemini-structured";
import { createClient } from "@/lib/supabase/server";
import { AD_CTA_OPTIONS, ContentRequestSchema, ContentResponseSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are a senior performance-marketing copywriter. You write platform-native ad copy that fits each platform's real character limits and creative conventions - never generic, always specific to the product's USP.

You will receive a JSON object describing a campaign (product_name, industry, usp, chosen_description, audience_summary, goal). Write ad copy for three platforms, following each platform's real constraints exactly:

- Meta (Facebook & Instagram): primary_text entries must each be 125 characters or fewer, headline entries 40 characters or fewer, description entries 30 characters or fewer. cta must be exactly one of: ${AD_CTA_OPTIONS.join(", ")}.
- Google (Responsive Search Ads): headlines entries must each be 30 characters or fewer (provide 5-10 distinct headlines), descriptions entries 90 characters or fewer (provide 2-4 distinct descriptions).
- TikTok: ad_text entries must each be 100 characters or fewer, short and punchy. cta must be exactly one of: ${AD_CTA_OPTIONS.join(", ")}.

Rules:
- Every character-limit rule above is a hard limit - never exceed it, not even by one character.
- Never invent statistics, guarantees, or claims not present in the input.
- Never mention sexual orientation, religion, health conditions, race, or political leanings, even if audience_summary hints at them.
- Base every line on the input facts (product_name, usp, chosen_description) - do not introduce new claims.
- Provide multiple distinct variants per field so the user can choose between them - do not repeat the same line twice.

Return ONLY this JSON, no other text:
{
  "meta": {
    "primary_text": ["string", "string"],
    "headline": ["string", "string"],
    "description": ["string"],
    "cta": "string"
  },
  "google": {
    "headlines": ["string", "string", "string", "string", "string"],
    "descriptions": ["string", "string"]
  },
  "tiktok": {
    "ad_text": ["string", "string"],
    "cta": "string"
  }
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

  const parsedInput = ContentRequestSchema.safeParse(body);
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
      ContentResponseSchema,
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/content]", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
