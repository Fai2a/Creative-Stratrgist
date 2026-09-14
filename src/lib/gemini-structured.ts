import { z } from "zod";
import { genAI, GEMINI_MODEL } from "@/lib/gemini";

const RETRY_INSTRUCTION =
  "Your previous response could not be parsed as valid JSON matching the required schema. Return ONLY valid JSON matching the schema - no markdown, no commentary, no other text.";

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

  // First attempt: structured output constrained to the schema.
  const attemptStructured = async () => {
    try {
      const interaction = await genAI.interactions.create({
        model: GEMINI_MODEL,
        system_instruction: systemPrompt,
        input: userContent,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: jsonSchema,
        },
      });
      if (!interaction.output_text) return null;
      return JSON.parse(interaction.output_text);
    } catch {
      return null;
    }
  };

  // Retry: plain JSON-mode with an explicit instruction, in case the
  // schema-constrained call itself failed (not just the parsed output).
  const attemptPlainJson = async () => {
    const interaction = await genAI.interactions.create({
      model: GEMINI_MODEL,
      system_instruction: systemPrompt,
      input: `${userContent}\n\n${RETRY_INSTRUCTION}`,
      response_format: {
        type: "text",
        mime_type: "application/json",
      },
    });
    if (!interaction.output_text) return null;
    try {
      return JSON.parse(interaction.output_text);
    } catch {
      return null;
    }
  };

  const firstAttempt = await attemptStructured();
  const firstResult = schema.safeParse(firstAttempt);
  if (firstResult.success) {
    return firstResult.data;
  }

  const secondAttempt = await attemptPlainJson();
  const secondResult = schema.safeParse(secondAttempt);
  if (!secondResult.success) {
    throw new Error(
      `Gemini response failed schema validation after retry: ${secondResult.error.message}`,
    );
  }
  return secondResult.data;
}
