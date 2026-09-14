import Link from "next/link";
import type { Campaign } from "@/lib/campaign";
import CampaignBriefCard from "@/components/CampaignBriefCard";

export default function SummaryStep({
  campaign,
  onStartNew,
}: {
  campaign: Campaign;
  onStartNew: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Campaign brief saved</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Here&apos;s everything we captured. You can find this again under
          My Campaigns.
        </p>
      </div>

      <CampaignBriefCard campaign={campaign} />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onStartNew}
          className="border border-neutral-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Start a new campaign
        </button>
        <Link
          href={`/dashboard/${campaign.id}`}
          className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          Generate ad content
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-neutral-600 hover:text-neutral-900 self-center"
        >
          View all campaigns
        </Link>
      </div>
    </div>
  );
}
