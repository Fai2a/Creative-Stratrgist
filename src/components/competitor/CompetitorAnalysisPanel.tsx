"use client";

import { useState } from "react";
import { Loader2, Plus, Swords, Target, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  buildAudienceSummaryFromCampaign,
  type Campaign,
  type CompetitorAnalysis,
} from "@/lib/campaign";
import type { CompetitorAnalysisResponse, CompetitorInput } from "@/lib/schemas";
import {
  buttonClasses,
  friendlyGenerationError,
  inputClass,
  sectionEyebrowClass,
} from "@/lib/ui";

const MAX_COMPETITORS = 5;
const EMPTY_ROW: CompetitorInput = { name: "", notes: "" };

export default function CompetitorAnalysisPanel({
  campaign,
  initialAnalysis,
}: {
  campaign: Campaign;
  initialAnalysis: CompetitorAnalysis | null;
}) {
  const [competitors, setCompetitors] = useState<CompetitorInput[]>(
    initialAnalysis?.competitors?.length
      ? initialAnalysis.competitors
      : [EMPTY_ROW],
  );
  const [analysis, setAnalysis] = useState<CompetitorAnalysisResponse | null>(
    initialAnalysis
      ? {
          competitor_insights: initialAnalysis.competitor_insights,
          overall_differentiation_strategy:
            initialAnalysis.overall_differentiation_strategy,
          suggested_messaging_angle: initialAnalysis.suggested_messaging_angle,
          caveat: initialAnalysis.caveat,
        }
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateCompetitor(index: number, patch: Partial<CompetitorInput>) {
    setCompetitors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  }

  function addCompetitor() {
    setCompetitors((prev) =>
      prev.length < MAX_COMPETITORS ? [...prev, EMPTY_ROW] : prev,
    );
  }

  function removeCompetitor(index: number) {
    setCompetitors((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAnalyze() {
    const namedCompetitors = competitors
      .map((c) => ({ name: c.name.trim(), notes: c.notes.trim() }))
      .filter((c) => c.name.length > 0);

    if (namedCompetitors.length === 0) {
      setError("Add at least one competitor name.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: campaign.product_name,
          industry: campaign.industry,
          usp: campaign.usp,
          chosen_description: campaign.chosen_description,
          audience_summary: buildAudienceSummaryFromCampaign(campaign),
          competitors: namedCompetitors,
        }),
      });

      const data: CompetitorAnalysisResponse & {
        error?: string;
        message?: string;
      } = await res.json();

      if (!res.ok) {
        setError(
          friendlyGenerationError(
            data,
            "Something went wrong analyzing competitors. Please try again.",
          ),
        );
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save this analysis.");

      const { error: saveError } = await supabase
        .from("competitor_analyses")
        .upsert(
          {
            campaign_id: campaign.id,
            user_id: user.id,
            competitors: namedCompetitors,
            competitor_insights: data.competitor_insights,
            overall_differentiation_strategy:
              data.overall_differentiation_strategy,
            suggested_messaging_angle: data.suggested_messaging_angle,
            caveat: data.caveat,
          },
          { onConflict: "campaign_id" },
        );
      if (saveError) throw saveError;

      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to analyze competitors.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Competitor analysis
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us who you&apos;re up against and what you already know about
          them - we don&apos;t browse the web, so the more detail you give,
          the sharper the analysis.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {competitors.map((c, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              type="text"
              placeholder="Competitor name"
              value={c.name}
              onChange={(e) => updateCompetitor(i, { name: e.target.value })}
              className={`${inputClass} w-44 sm:w-48 shrink-0`}
            />
            <input
              type="text"
              placeholder="What do you know about them? (pricing, positioning, tagline...)"
              value={c.notes}
              onChange={(e) => updateCompetitor(i, { notes: e.target.value })}
              className={`${inputClass} flex-1`}
            />
            {competitors.length > 1 && (
              <button
                type="button"
                onClick={() => removeCompetitor(i)}
                aria-label="Remove competitor"
                className="text-muted-foreground hover:text-red-600 h-[42px] w-[42px] flex items-center justify-center rounded-lg hover:bg-red-50 transition shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {competitors.length < MAX_COMPETITORS && (
          <button
            type="button"
            onClick={addCompetitor}
            className="self-start inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add competitor
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading}
        className={buttonClasses("primary", "md", "self-start")}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Swords className="h-4 w-4" />
        )}
        {loading
          ? "Analyzing..."
          : analysis
            ? "Re-analyze"
            : "Analyze competitors"}
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {analysis && (
        <div className="flex flex-col gap-4">
          {analysis.caveat && (
            <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
              {analysis.caveat}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {analysis.competitor_insights.map((insight) => (
              <div
                key={insight.name}
                className="rounded-xl bg-muted p-4 flex flex-col gap-2.5"
              >
                <h3 className="font-medium">{insight.name}</h3>
                <div>
                  <div className={sectionEyebrowClass}>Apparent positioning</div>
                  <p className="text-sm mt-0.5">{insight.apparent_positioning}</p>
                </div>
                <div>
                  <div className={sectionEyebrowClass}>Strength</div>
                  <p className="text-sm mt-0.5">{insight.perceived_strength}</p>
                </div>
                <div>
                  <div className={sectionEyebrowClass}>Weakness</div>
                  <p className="text-sm mt-0.5">{insight.perceived_weakness}</p>
                </div>
                <div>
                  <div className={sectionEyebrowClass}>Your angle</div>
                  <p className="text-sm mt-0.5">{insight.differentiation_angle}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <Target className="h-4 w-4" />
              Your differentiation strategy
            </div>
            <div>
              <div className={sectionEyebrowClass}>Overall strategy</div>
              <p className="text-sm mt-0.5">
                {analysis.overall_differentiation_strategy}
              </p>
            </div>
            <div>
              <div className={sectionEyebrowClass}>Suggested messaging angle</div>
              <p className="text-sm mt-0.5">{analysis.suggested_messaging_angle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
