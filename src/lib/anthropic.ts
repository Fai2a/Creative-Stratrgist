import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

// A current-generation Claude model, used for both the /api/description
// and /api/budget routes.
export const CLAUDE_MODEL = "claude-opus-5";
