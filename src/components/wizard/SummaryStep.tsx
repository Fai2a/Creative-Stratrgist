import Link from "next/link";
import Image from "next/image";
import type { Campaign } from "@/lib/campaign";

function formatMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

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

      <div className="rounded-lg border border-neutral-200 p-5 flex flex-col gap-5">
        <div className="flex gap-4">
          {campaign.product_image_url && (
            <Image
              src={campaign.product_image_url}
              alt={campaign.product_name}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 object-cover rounded-md border border-neutral-200 shrink-0"
            />
          )}
          <div>
            <h3 className="font-medium text-lg">{campaign.product_name}</h3>
            <p className="text-sm text-neutral-500">
              {campaign.industry} ·{" "}
              {campaign.mode === "brand" ? "Specific brand" : "General audience"}
            </p>
            {campaign.website_url && (
              <a
                href={campaign.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-600 underline"
              >
                {campaign.website_url}
              </a>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Description
          </div>
          <p className="text-sm">{campaign.chosen_description}</p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Audience
          </div>
          <p className="text-sm">
            Ages {campaign.age_min}-{campaign.age_max} ·{" "}
            {campaign.gender === "all" ? "All genders" : campaign.gender} ·{" "}
            {campaign.location}
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
            Budget plan
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-neutral-500">Total budget</div>
              <div className="font-medium">
                {formatMoney(campaign.budget_range_total[0])} -{" "}
                {formatMoney(campaign.budget_range_total[1])}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Daily spend</div>
              <div className="font-medium">
                {formatMoney(campaign.daily_spend_range[0])} -{" "}
                {formatMoney(campaign.daily_spend_range[1])}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {campaign.platform_split.map((p) => (
              <div key={p.platform} className="text-sm flex justify-between">
                <span>{p.platform}</span>
                <span className="text-neutral-600">{p.pct}%</span>
              </div>
            ))}
          </div>
          {campaign.budget_warning && (
            <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 mt-3">
              {campaign.budget_warning}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onStartNew}
          className="border border-neutral-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Start a new campaign
        </button>
        <Link
          href="/dashboard"
          className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          View all campaigns
        </Link>
      </div>
    </div>
  );
}
