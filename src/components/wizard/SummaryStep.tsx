import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import type { Campaign } from "@/lib/campaign";
import CampaignBriefCard from "@/components/CampaignBriefCard";
import { buttonClasses } from "@/lib/ui";

export default function SummaryStep({
  campaign,
  onStartNew,
}: {
  campaign: Campaign;
  onStartNew: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Campaign brief saved
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Here&apos;s everything we captured. You can find this again under
          My Campaigns.
        </p>
      </div>

      <CampaignBriefCard campaign={campaign} />

      <div className="flex flex-wrap gap-3 justify-center pt-1">
        <button
          type="button"
          onClick={onStartNew}
          className={buttonClasses("outline", "md")}
        >
          Start a new campaign
        </button>
        <Link href={`/dashboard/${campaign.id}`} className={buttonClasses("primary", "md")}>
          <Sparkles className="h-4 w-4" />
          Generate ad content
        </Link>
        <Link href="/dashboard" className={buttonClasses("ghost", "md")}>
          View all campaigns
        </Link>
      </div>
    </div>
  );
}
