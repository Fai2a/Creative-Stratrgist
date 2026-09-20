import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPlanInfo } from "@/lib/subscription-server";
import { FREE_CAMPAIGN_LIMIT } from "@/lib/subscription";
import WizardClient from "@/components/wizard/WizardClient";
import { buttonClasses, cardClass } from "@/lib/ui";

export default async function WizardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { limitReached } = user
    ? await getPlanInfo(supabase, user.id)
    : { limitReached: false };

  if (limitReached) {
    return (
      <main className="flex-1 px-4 py-12 bg-grid flex items-center justify-center">
        <div className={`${cardClass} p-8 flex flex-col items-center text-center gap-3 max-w-sm`}>
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-semibold text-lg">Free plan limit reached</h2>
          <p className="text-sm text-muted-foreground">
            The free plan includes up to {FREE_CAMPAIGN_LIMIT} campaigns.
            Upgrade to Pro for unlimited campaigns.
          </p>
          <Link href="/pricing" className={buttonClasses("primary", "md", "mt-2")}>
            View plans
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-12 bg-grid">
      <WizardClient />
    </main>
  );
}
