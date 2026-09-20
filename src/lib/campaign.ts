import type {
  BudgetResponse,
  CompetitorAnalysisResponse,
  CompetitorInput,
  ContentResponse,
} from "@/lib/schemas";

export type CampaignMode = "brand" | "general";
export type Gender = "all" | "male" | "female";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "all", label: "All genders" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

export const GOAL_OPTIONS = [
  { value: "awareness", label: "Awareness" },
  { value: "traffic", label: "Traffic" },
  { value: "leads", label: "Leads" },
  { value: "sales", label: "Sales" },
];

/** Shape of a row in the `campaigns` table. */
export interface Campaign {
  id: string;
  user_id: string;
  mode: CampaignMode;
  age_min: number;
  age_max: number;
  gender: Gender;
  location: string;
  industry: string;
  usp: string;
  product_name: string;
  raw_description: string | null;
  chosen_description: string;
  product_image_url: string | null;
  website_url: string | null;
  price: number | null;
  goal: string;
  campaign_length_days: number;
  user_budget_cap: number | null;
  budget_range_total: [number, number];
  daily_spend_range: [number, number];
  platform_split: BudgetResponse["platform_split"];
  mode_recommendation: BudgetResponse["mode_recommendation"];
  budget_reasoning: string;
  budget_warning: string | null;
  status: "draft" | "active";
  created_at: string;
}

/** Shape of a row in the `ad_content` table (Phase 2). */
export interface AdContent {
  id: string;
  campaign_id: string;
  user_id: string;
  meta: ContentResponse["meta"];
  google: ContentResponse["google"];
  tiktok: ContentResponse["tiktok"];
  created_at: string;
}

/** Shape of a row in the `competitor_analyses` table (Phase 2). */
export interface CompetitorAnalysis {
  id: string;
  campaign_id: string;
  user_id: string;
  competitors: CompetitorInput[];
  competitor_insights: CompetitorAnalysisResponse["competitor_insights"];
  overall_differentiation_strategy: string;
  suggested_messaging_angle: string;
  caveat: string | null;
  created_at: string;
}

/** In-progress state held by the wizard before the campaign is saved. */
export interface WizardState {
  mode: CampaignMode | null;

  websiteUrl: string;
  productImageFile: File | null;
  productImageUrl: string | null;
  productName: string;
  rawDescription: string;
  usp: string;
  industry: string;
  price: string;

  ageMin: number;
  ageMax: number;
  gender: Gender;
  location: string;

  chosenDescription: string;

  goal: string;
  campaignLengthDays: number;
  userBudgetCap: string;
  budgetResult: BudgetResponse | null;
}

export const INITIAL_WIZARD_STATE: WizardState = {
  mode: null,

  websiteUrl: "",
  productImageFile: null,
  productImageUrl: null,
  productName: "",
  rawDescription: "",
  usp: "",
  industry: "",
  price: "",

  ageMin: 18,
  ageMax: 65,
  gender: "all",
  location: "",

  chosenDescription: "",

  goal: "sales",
  campaignLengthDays: 30,
  userBudgetCap: "",
  budgetResult: null,
};

export function buildAudienceSummary(state: WizardState): string {
  return formatAudienceSummary(
    state.ageMin,
    state.ageMax,
    state.gender,
    state.location,
  );
}

/** Same audience summary format, built from a saved campaign row instead. */
export function buildAudienceSummaryFromCampaign(campaign: Campaign): string {
  return formatAudienceSummary(
    campaign.age_min,
    campaign.age_max,
    campaign.gender,
    campaign.location,
  );
}

function formatAudienceSummary(
  ageMin: number,
  ageMax: number,
  gender: Gender,
  location: string,
): string {
  const genderLabel = gender === "all" ? "all genders" : `${gender}s`;
  return `Ages ${ageMin}-${ageMax}, ${genderLabel}, based in ${
    location || "an unspecified location"
  }.`;
}

/**
 * Phase 1 placeholder: a deterministic heuristic estimate of reachable
 * audience size. Real audience sizing (platform APIs) is out of scope for
 * this MVP - this just gives the /api/budget route a plausible number to
 * reason about.
 */
export function estimateAudienceSize(state: WizardState): number {
  const BASE = 5_000_000;
  const ageWidth = Math.max(1, state.ageMax - state.ageMin);
  const ageFactor = Math.min(1, ageWidth / 47);
  const genderFactor = state.gender === "all" ? 1 : 0.5;
  const locationFactor = state.location.trim() ? 0.2 : 1;

  const estimate = BASE * ageFactor * genderFactor * locationFactor;
  return Math.max(10_000, Math.round(estimate));
}
