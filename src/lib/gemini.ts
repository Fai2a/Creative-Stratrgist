import { GoogleGenAI } from "@google/genai";

export const genAI = new GoogleGenAI({});

// A free-tier-eligible current-generation Flash model, used for both the
// /api/description and /api/budget routes.
export const GEMINI_MODEL = "gemini-3.8-flash";
