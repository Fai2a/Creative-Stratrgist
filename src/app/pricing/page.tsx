import { createClient } from "@/lib/supabase/server";
import { getPlanInfo } from "@/lib/subscription-server";
import { FREE_CAMPAIGN_LIMIT } from "@/lib/subscription";
import PricingCards from "@/components/billing/PricingCards";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const plan = user ? await getPlanInfo(supabase, user.id) : null;

  return (
    <main className="flex-1 px-4 py-16 bg-grid">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Simple, honest pricing
        </h1>
        <p className="text-muted-foreground max-w-lg">
          Start free with up to {FREE_CAMPAIGN_LIMIT} campaigns. Upgrade any
          time for unlimited campaigns and every AI feature.
        </p>
      </div>

      <PricingCards isLoggedIn={!!user} isPro={plan?.pro ?? false} />
    </main>
  );
}
