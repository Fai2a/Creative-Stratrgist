import { z } from "zod";

// ---------------------------------------------------------------------------
// POST /api/description
// ---------------------------------------------------------------------------

export const DescriptionModeSchema = z.enum([
  "keep",
  "polish",
  "rewrite",
  "generate",
]);
export type DescriptionMode = z.infer<typeof DescriptionModeSchema>;

export const DescriptionRequestSchema = z.object({
  product_name: z.string().min(1),
  industry: z.string().min(1),
  usp: z.string(),
  raw_description: z.string().nullable(),
  mode: DescriptionModeSchema,
  audience_summary: z.string(),
});
export type DescriptionRequest = z.infer<typeof DescriptionRequestSchema>;

export const DescriptionOptionSchema = z.object({
  text: z.string(),
  tone: z.string(),
});

export const DescriptionResponseSchema = z.object({
  description_options: z.array(DescriptionOptionSchema),
  error: z.enum(["missing_usp"]).nullable(),
});
export type DescriptionResponse = z.infer<typeof DescriptionResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/budget
// ---------------------------------------------------------------------------

export const BudgetRequestSchema = z.object({
  stage: z.literal("initial"),
  industry: z.string().min(1),
  goal: z.string().min(1),
  campaign_length_days: z.number().int().positive(),
  audience_size_estimate: z.number().positive(),
  user_budget_cap: z.number().positive().nullable(),
});
export type BudgetRequest = z.infer<typeof BudgetRequestSchema>;

export const PlatformSplitSchema = z.object({
  platform: z.string(),
  pct: z.number(),
});

export const BudgetResponseSchema = z.object({
  budget_range_total: z.tuple([z.number(), z.number()]),
  daily_spend_range: z.tuple([z.number(), z.number()]),
  platform_split: z.array(PlatformSplitSchema),
  mode_recommendation: z.enum(["suggest_only", "auto_manage_eligible"]),
  reasoning: z.string(),
  warning: z.string().nullable(),
});
export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;
