import { ApiError } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { genAI, GEMINI_MODEL } from "@/lib/gemini";

const RETRY_INSTRUCTION =
  "Your previous response could not be parsed as valid JSON matching the required schema. Return ONLY valid JSON matching the schema - no markdown, no commentary, no other text.";

/** Thrown when Gemini's free-tier rate limit (requests/minute) is hit. */
export class GeminiRateLimitError extends Error {
  constructor() {
    super("Gemini free-tier rate limit reached");
    this.name = "GeminiRateLimitError";
  }
}

/**
 * Runs one interaction and returns its parsed JSON output (or null if the
 * call produced no text or unparseable text). A 429 is converted to
 * GeminiRateLimitError and re-thrown immediately - retrying it would just
 * burn another request against the same exhausted per-minute quota.
 */
async function createAndParse(
  systemPrompt: string,
  input: string,
  schema?: Record<string, unknown>,
): Promise<unknown> {
  try {
    const interaction = await genAI.interactions.create({
      model: GEMINI_MODEL,
      system_instruction: systemPrompt,
      input,
      response_format: schema
        ? { type: "text", mime_type: "application/json", schema }
        : { type: "text", mime_type: "application/json" },
    });
    if (!interaction.output_text) return null;
    try {
      return JSON.parse(interaction.output_text);
    } catch {
      return null;
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      throw new GeminiRateLimitError();
    }
    return null;
  }
}

/**
 * Calls Gemini with a schema-constrained structured output (response_format)
 * derived from the given zod schema, then validates the result with that same
 * schema. Structured outputs already guarantee schema-conformant JSON, but if
 * parsing/validation still fails for any reason, retries once with an
 * explicit instruction to return only valid JSON.
 */
export async function callGeminiStructured<Schema extends z.ZodTypeAny>(
  systemPrompt: string,
  userInput: unknown,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const userContent = JSON.stringify(userInput);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema, ...jsonSchema } = z.toJSONSchema(schema) as Record<
    string,
    unknown
  >;

  const firstAttempt = await createAndParse(systemPrompt, userContent, jsonSchema);
  const firstResult = schema.safeParse(firstAttempt);
  if (firstResult.success) {
    return firstResult.data;
  }

  const secondAttempt = await createAndParse(
    systemPrompt,
    `${userContent}\n\n${RETRY_INSTRUCTION}`,
  );
  const secondResult = schema.safeParse(secondAttempt);
  if (!secondResult.success) {
    throw new Error(
      `Gemini response failed schema validation after retry: ${secondResult.error.message}`,
    );
  }
  return secondResult.data;
}

/**
 * Shared catch-block handler for the AI routes: logs the error and returns
 * the right response - a distinct, retryable "rate_limited" for Gemini's
 * free-tier per-minute cap, a generic failure otherwise.
 */
export function geminiErrorResponse(routeLabel: string, err: unknown) {
  console.error(routeLabel, err);
  if (err instanceof GeminiRateLimitError) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "You're generating content faster than the free Gemini tier allows. Wait about a minute and try again.",
      },
      { status: 429 },
    );
  }
  return NextResponse.json({ error: "generation_failed" }, { status: 502 });
}
