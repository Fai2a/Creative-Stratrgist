"use client";

import { useState } from "react";
import { Loader2, Music2, Search, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  buildAudienceSummaryFromCampaign,
  type AdContent,
  type Campaign,
} from "@/lib/campaign";
import type { ContentResponse } from "@/lib/schemas";
import CopyableLine from "@/components/content/CopyableLine";
import { buttonClasses, sectionEyebrowClass } from "@/lib/ui";

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

      const data: ContentResponse & { error?: string; message?: string } =
        await res.json();

      if (!res.ok) {
        setError(
          data.error === "rate_limited" && data.message
            ? data.message
            : "Something went wrong generating ad content. Please try again.",
        );
        return;
      }

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Ad content</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Platform-native copy, generated from this campaign&apos;s
            description and audience.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className={buttonClasses("primary", "md", "shrink-0")}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading
            ? "Generating..."
            : content
              ? "Regenerate"
              : "Generate ad content"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {content && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-muted p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                f
              </span>
              <div>
                <h3 className="font-medium leading-tight">Meta</h3>
                <p className="text-xs text-muted-foreground">Facebook & Instagram</p>
              </div>
            </div>

            <div>
              <div className={sectionEyebrowClass}>Primary text</div>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {content.meta.primary_text.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div>
              <div className={sectionEyebrowClass}>Headline</div>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {content.meta.headline.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div>
              <div className={sectionEyebrowClass}>Description</div>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {content.meta.description.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div className="text-sm pt-1 border-t border-border">
              <span className="text-muted-foreground">CTA button: </span>
              <span className="font-medium">{content.meta.cta}</span>
            </div>
          </div>

          <div className="rounded-xl bg-muted p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] text-white flex items-center justify-center shrink-0">
                <Search className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-medium leading-tight">Google</h3>
                <p className="text-xs text-muted-foreground">Responsive Search Ads</p>
              </div>
            </div>

            <div>
              <div className={sectionEyebrowClass}>Headlines</div>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {content.google.headlines.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div>
              <div className={sectionEyebrowClass}>Descriptions</div>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {content.google.descriptions.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-muted p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
                <Music2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-medium leading-tight">TikTok</h3>
                <p className="text-xs text-muted-foreground">In-feed ads</p>
              </div>
            </div>

            <div>
              <div className={sectionEyebrowClass}>Ad text</div>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {content.tiktok.ad_text.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </div>

            <div className="text-sm pt-1 border-t border-border">
              <span className="text-muted-foreground">CTA button: </span>
              <span className="font-medium">{content.tiktok.cta}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
