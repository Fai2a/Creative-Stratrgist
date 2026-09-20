import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_CAMPAIGN_LIMIT, isPro, type Subscription } from "@/lib/subscription";

export interface PlanInfo {
  subscription: Subscription | null;
  pro: boolean;
  campaignCount: number;
  limitReached: boolean;
}

/** Server-side only: reads a user's subscription + campaign count together. */
export async function getPlanInfo(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlanInfo> {
  const [{ data: subscription }, { count }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<Subscription>(),
    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const pro = isPro(subscription ?? null);
  const campaignCount = count ?? 0;

  return {
    subscription: subscription ?? null,
    pro,
    campaignCount,
    limitReached: !pro && campaignCount >= FREE_CAMPAIGN_LIMIT,
  };
}
