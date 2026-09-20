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

/** Thrown when Gemini itself is down/overloaded (HTTP 503). */
export class GeminiUnavailableError extends Error {
  constructor() {
    super("Gemini is temporarily unavailable");
    this.name = "GeminiUnavailableError";
  }
}

// Bound how long we wait before giving up - without this, an outage on
// Google's end can hang the request far longer than a user will wait.
const REQUEST_TIMEOUT_MS = 25_000;

/**
 * The classic Schema type (used by `responseSchema` below) doesn't support
 * `prefixItems` (zod's JSON Schema output for z.tuple(...)) - it 400s with
 * "Unknown name \"prefixItems\"". Our tuples are always homogeneous (e.g.
 * [number, number]), so collapsing prefixItems into a plain `items` schema
 * loses no information we actually rely on; our own zod validation of the
 * response still enforces the exact shape.
 */
function stripPrefixItems(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(stripPrefixItems);
  if (node && typeof node === "object") {
    const obj: Record<string, unknown> = { ...(node as Record<string, unknown>) };
    if (Array.isArray(obj.prefixItems)) {
      obj.items = stripPrefixItems(obj.prefixItems[0]);
      delete obj.prefixItems;
    }
    for (const key of Object.keys(obj)) {
      obj[key] = stripPrefixItems(obj[key]);
    }
    return obj;
  }
  return node;
}

/**
 * Runs one generateContent call and returns its parsed JSON output (or null
 * if the call produced no text or unparseable text). A 429 is converted to
 * GeminiRateLimitError and a 503 to GeminiUnavailableError, both re-thrown
 * immediately - retrying either would just repeat the same failure.
 *
 * Uses the classic `models.generateContent` method rather than the newer
 * Interactions API (`interactions.create`): when this was built, the
 * Interactions API was hanging/timing out outright (even for plain
 * unstructured calls) while generateContent responded normally - revisit if
 * that stabilizes.
 */
async function generateAndParse(
  systemPrompt: string,
  input: string,
  schema?: Record<string, unknown>,
): Promise<unknown> {
  try {
    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: input,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        ...(schema ? { responseSchema: stripPrefixItems(schema) } : {}),
        httpOptions: { timeout: REQUEST_TIMEOUT_MS },
      },
    });
    if (!response.text) return null;
    try {
      return JSON.parse(response.text);
    } catch {
      return null;
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      throw new GeminiRateLimitError();
    }
    if (err instanceof ApiError && err.status === 503) {
      throw new GeminiUnavailableError();
    }
    return null;
  }
}

/**
 * Calls Gemini with a schema-constrained structured output (responseSchema)
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

  const firstAttempt = await generateAndParse(systemPrompt, userContent, jsonSchema);
  const firstResult = schema.safeParse(firstAttempt);
  if (firstResult.success) {
    return firstResult.data;
  }

  const secondAttempt = await generateAndParse(
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
  if (err instanceof GeminiUnavailableError) {
    return NextResponse.json(
      {
        error: "service_unavailable",
        message:
          "Gemini is temporarily overloaded on Google's end. Please try again in a minute.",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ error: "generation_failed" }, { status: 502 });
}
