import { GoogleGenAI } from "@google/genai";

export const genAI = new GoogleGenAI({});

// A free-tier-eligible Flash model, used across all four AI routes.
// gemini-3.6/3.7/3.8-flash are newer but were returning 503 "high demand"
// errors / hanging outright when this was last checked - gemini-3.5-flash
// is the most recent model confirmed stable. Revisit if the newer ones
// stabilize.
export const GEMINI_MODEL = "gemini-3.5-flash";
