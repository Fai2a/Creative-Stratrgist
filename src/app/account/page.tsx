import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlanInfo } from "@/lib/subscription-server";
import { FREE_CAMPAIGN_LIMIT } from "@/lib/subscription";
import AccountBilling from "@/components/billing/AccountBilling";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/account");
  }

  const plan = await getPlanInfo(supabase, user.id);

  return (
    <main className="flex-1 px-4 py-12 bg-grid">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account & billing</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>

        <AccountBilling
          pro={plan.pro}
          campaignCount={plan.campaignCount}
          freeLimit={FREE_CAMPAIGN_LIMIT}
          currentPeriodEnd={plan.subscription?.current_period_end ?? null}
          status={plan.subscription?.status ?? "free"}
          checkoutStatus={checkout === "success" || checkout === "canceled" ? checkout : null}
        />
      </div>
    </main>
  );
}
