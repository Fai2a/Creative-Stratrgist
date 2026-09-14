import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdContent, Campaign, CompetitorAnalysis } from "@/lib/campaign";
import CampaignBriefCard from "@/components/CampaignBriefCard";
import AdContentPanel from "@/components/content/AdContentPanel";
import CompetitorAnalysisPanel from "@/components/competitor/CompetitorAnalysisPanel";

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
    <main className="flex-1 px-4 py-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <Link href="/dashboard" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Back to My Campaigns
        </Link>

        <CampaignBriefCard campaign={campaign} />

        <CompetitorAnalysisPanel
          campaign={campaign}
          initialAnalysis={competitorAnalysis ?? null}
        />

        <AdContentPanel campaign={campaign} initialAdContent={adContent ?? null} />
      </div>
    </main>
  );
}
