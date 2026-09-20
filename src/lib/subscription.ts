export const FREE_CAMPAIGN_LIMIT = 2;

export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";

/** Shape of a row in the `subscriptions` table. */
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

/** Only "active" counts as Pro - past_due/canceled fall back to free limits. */
export function isPro(subscription: Subscription | null): boolean {
  return subscription?.status === "active";
}
