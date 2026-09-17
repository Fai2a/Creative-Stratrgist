import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdContent, Campaign, CompetitorAnalysis } from "@/lib/campaign";
import CampaignBriefCard from "@/components/CampaignBriefCard";
import AdContentPanel from "@/components/content/AdContentPanel";
import CompetitorAnalysisPanel from "@/components/competitor/CompetitorAnalysisPanel";
import { cardClass } from "@/lib/ui";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single<Campaign>();

  if (!campaign) {
    notFound();
  }

  const { data: adContent } = await supabase
    .from("ad_content")
    .select("*")
    .eq("campaign_id", id)
    .maybeSingle<AdContent>();

  const { data: competitorAnalysis } = await supabase
    .from("competitor_analyses")
    .select("*")
    .eq("campaign_id", id)
    .maybeSingle<CompetitorAnalysis>();

  return (
    <main className="flex-1 px-4 py-12 bg-grid">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Campaigns
        </Link>

        <CampaignBriefCard campaign={campaign} />

        <div className={`${cardClass} p-6 sm:p-8`}>
          <CompetitorAnalysisPanel
            campaign={campaign}
            initialAnalysis={competitorAnalysis ?? null}
          />
        </div>

        <div className={`${cardClass} p-6 sm:p-8`}>
          <AdContentPanel campaign={campaign} initialAdContent={adContent ?? null} />
        </div>
      </div>
    </main>
  );
}
