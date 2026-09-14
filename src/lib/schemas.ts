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

// ---------------------------------------------------------------------------
// POST /api/content (Phase 2: ad copy generation)
// ---------------------------------------------------------------------------

export const AD_CTA_OPTIONS = [
  "Shop Now",
  "Learn More",
  "Sign Up",
  "Get Offer",
  "Download",
  "Contact Us",
  "Subscribe",
  "Book Now",
] as const;
export const AdCtaSchema = z.enum(AD_CTA_OPTIONS);

export const ContentRequestSchema = z.object({
  product_name: z.string().min(1),
  industry: z.string().min(1),
  usp: z.string().min(1),
  chosen_description: z.string().min(1),
  audience_summary: z.string(),
  goal: z.string().min(1),
});
export type ContentRequest = z.infer<typeof ContentRequestSchema>;

// Meta (Facebook/Instagram): real platform character limits.
export const MetaAdContentSchema = z.object({
  primary_text: z.array(z.string().max(125)).min(2).max(3),
  headline: z.array(z.string().max(40)).min(2).max(3),
  description: z.array(z.string().max(30)).min(1).max(2),
  cta: AdCtaSchema,
});

// Google (Responsive Search Ads): real platform character limits.
export const GoogleAdContentSchema = z.object({
  headlines: z.array(z.string().max(30)).min(5).max(10),
  descriptions: z.array(z.string().max(90)).min(2).max(4),
});

// TikTok: real platform character limits.
export const TiktokAdContentSchema = z.object({
  ad_text: z.array(z.string().max(100)).min(2).max(3),
  cta: AdCtaSchema,
});

export const ContentResponseSchema = z.object({
  meta: MetaAdContentSchema,
  google: GoogleAdContentSchema,
  tiktok: TiktokAdContentSchema,
});
export type ContentResponse = z.infer<typeof ContentResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/competitor-analysis (Phase 2)
// ---------------------------------------------------------------------------

export const CompetitorInputSchema = z.object({
  name: z.string().min(1),
  notes: z.string(),
});
export type CompetitorInput = z.infer<typeof CompetitorInputSchema>;

export const CompetitorAnalysisRequestSchema = z.object({
  product_name: z.string().min(1),
  industry: z.string().min(1),
  usp: z.string().min(1),
  chosen_description: z.string().min(1),
  audience_summary: z.string(),
  competitors: z.array(CompetitorInputSchema).min(1).max(5),
});
export type CompetitorAnalysisRequest = z.infer<
  typeof CompetitorAnalysisRequestSchema
>;

export const CompetitorInsightSchema = z.object({
  name: z.string(),
  apparent_positioning: z.string(),
  perceived_strength: z.string(),
  perceived_weakness: z.string(),
  differentiation_angle: z.string(),
});

export const CompetitorAnalysisResponseSchema = z.object({
  competitor_insights: z.array(CompetitorInsightSchema),
  overall_differentiation_strategy: z.string(),
  suggested_messaging_angle: z.string(),
  caveat: z.string().nullable(),
});
export type CompetitorAnalysisResponse = z.infer<
  typeof CompetitorAnalysisResponseSchema
>;
