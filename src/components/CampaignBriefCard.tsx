import Image from "next/image";
import { ExternalLink, Package } from "lucide-react";
import type { Campaign } from "@/lib/campaign";
import { cardClass, sectionEyebrowClass } from "@/lib/ui";

function formatMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function CampaignBriefCard({ campaign }: { campaign: Campaign }) {
  return (
    <div className={`${cardClass} p-6 flex flex-col gap-6`}>
      <div className="flex gap-4">
        <div className="h-20 w-20 rounded-xl border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
          {campaign.product_image_url ? (
            <Image
              src={campaign.product_image_url}
              alt={campaign.product_name}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 object-cover"
            />
          ) : (
            <Package className="h-7 w-7 text-neutral-400" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-lg tracking-tight truncate">
            {campaign.product_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {campaign.industry} ·{" "}
            {campaign.mode === "brand" ? "Specific brand" : "General audience"}
          </p>
          {campaign.website_url && (
            <a
              href={campaign.website_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-0.5 break-all"
            >
              {campaign.website_url}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}
        </div>
      </div>

      <div>
        <div className={sectionEyebrowClass}>Description</div>
        <p className="text-sm leading-relaxed mt-1.5">
          {campaign.chosen_description}
        </p>
      </div>

      <div>
        <div className={sectionEyebrowClass}>Audience</div>
        <p className="text-sm mt-1.5">
          Ages {campaign.age_min}-{campaign.age_max} ·{" "}
          {campaign.gender === "all" ? "All genders" : campaign.gender} ·{" "}
          {campaign.location}
        </p>
      </div>

      <div>
        <div className={sectionEyebrowClass}>Budget plan</div>
        <div className="grid sm:grid-cols-2 gap-3 mt-2 mb-3">
          <div className="rounded-xl bg-muted px-4 py-3">
            <div className="text-xs text-muted-foreground">Total budget</div>
            <div className="font-semibold">
              {formatMoney(campaign.budget_range_total[0])} -{" "}
              {formatMoney(campaign.budget_range_total[1])}
            </div>
          </div>
          <div className="rounded-xl bg-muted px-4 py-3">
            <div className="text-xs text-muted-foreground">Daily spend</div>
            <div className="font-semibold">
              {formatMoney(campaign.daily_spend_range[0])} -{" "}
              {formatMoney(campaign.daily_spend_range[1])}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {campaign.platform_split.map((p) => (
            <div key={p.platform} className="flex items-center gap-3">
              <span className="text-sm w-28 shrink-0 truncate">
                {p.platform}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${Math.min(100, p.pct)}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right">
                {p.pct}%
              </span>
            </div>
          ))}
        </div>
        {campaign.budget_warning && (
          <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 mt-3">
            {campaign.budget_warning}
          </p>
        )}
      </div>
    </div>
  );
}
