import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";

const RETRY_INSTRUCTION =
  "Your previous response could not be parsed as valid JSON matching the required schema. Return ONLY valid JSON matching the schema - no markdown, no commentary, no other text.";

/**
 * Calls Claude with a schema-constrained structured output (output_config.format)
 * and validates the result with the given zod schema. Structured outputs already
 * guarantee schema-conformant JSON, but if parsing/validation still fails for any
 * reason, retries once with an explicit instruction to return only valid JSON.
 */
export async function callClaudeStructured<Schema extends z.ZodTypeAny>(
  systemPrompt: string,
  userInput: unknown,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const userContent = JSON.stringify(userInput);

  const attempt = async (extraInstruction?: string) => {
    const response = await anthropic.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      output_config: {
        format: zodOutputFormat(schema),
        effort: "medium",
      },
      messages: [
        {
          role: "user",
          content: extraInstruction
            ? `${userContent}\n\n${extraInstruction}`
            : userContent,
        },
      ],
    });
    return response.parsed_output;
  };

  const firstAttempt = await attempt();
  const firstResult = schema.safeParse(firstAttempt);
  if (firstResult.success) {
    return firstResult.data;
  }

  const secondAttempt = await attempt(RETRY_INSTRUCTION);
  const secondResult = schema.safeParse(secondAttempt);
  if (!secondResult.success) {
    throw new Error(
      `Claude response failed schema validation after retry: ${secondResult.error.message}`,
    );
  }
  return secondResult.data;
}
