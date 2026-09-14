"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  buildAudienceSummaryFromCampaign,
  type AdContent,
  type Campaign,
} from "@/lib/campaign";
import type { ContentResponse } from "@/lib/schemas";
import CopyableLine from "@/components/content/CopyableLine";

export default function AdContentPanel({
  campaign,
  initialAdContent,
}: {
  campaign: Campaign;
  initialAdContent: AdContent | null;
}) {
  const [content, setContent] = useState<ContentResponse | null>(
    initialAdContent
      ? {
          meta: initialAdContent.meta,
          google: initialAdContent.google,
          tiktok: initialAdContent.tiktok,
        }
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: campaign.product_name,
          industry: campaign.industry,
          usp: campaign.usp,
          chosen_description: campaign.chosen_description,
          audience_summary: buildAudienceSummaryFromCampaign(campaign),
          goal: campaign.goal,
        }),
      });

      if (!res.ok) {
        setError("Something went wrong generating ad content. Please try again.");
        return;
      }

      const data: ContentResponse = await res.json();

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save ad content.");

      const { error: saveError } = await supabase.from("ad_content").upsert(
        {
          campaign_id: campaign.id,
          user_id: user.id,
          meta: data.meta,
          google: data.google,
          tiktok: data.tiktok,
        },
        { onConflict: "campaign_id" },
      );
      if (saveError) throw saveError;

      setContent(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to generate ad content.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ad content</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Platform-native copy, generated from this campaign&apos;s
            description and audience.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 shrink-0"
        >
          {loading
            ? "Generating..."
            : content
              ? "Regenerate"
              : "Generate ad content"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {content && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 p-4 flex flex-col gap-4">
            <div>
              <h3 className="font-medium">Meta</h3>
              <p className="text-xs text-neutral-500">Facebook & Instagram</p>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Primary text
              </div>
              <div className="flex flex-col gap-1.5">
                {content.meta.primary_text.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Headline
              </div>
              <div className="flex flex-col gap-1.5">
                {content.meta.headline.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Description
              </div>
              <div className="flex flex-col gap-1.5">
                {content.meta.description.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div className="text-sm">
              <span className="text-neutral-500">CTA button: </span>
              <span className="font-medium">{content.meta.cta}</span>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4 flex flex-col gap-4">
            <div>
              <h3 className="font-medium">Google</h3>
              <p className="text-xs text-neutral-500">Responsive Search Ads</p>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Headlines
              </div>
              <div className="flex flex-col gap-1.5">
                {content.google.headlines.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Descriptions
              </div>
              <div className="flex flex-col gap-1.5">
                {content.google.descriptions.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4 flex flex-col gap-4">
            <div>
              <h3 className="font-medium">TikTok</h3>
              <p className="text-xs text-neutral-500">In-feed ads</p>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Ad text
              </div>
              <div className="flex flex-col gap-1.5">
                {content.tiktok.ad_text.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div className="text-sm">
              <span className="text-neutral-500">CTA button: </span>
              <span className="font-medium">{content.tiktok.cta}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
