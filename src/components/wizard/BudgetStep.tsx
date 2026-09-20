"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  PiggyBank,
  SlidersHorizontal,
} from "lucide-react";
import {
  estimateAudienceSize,
  GOAL_OPTIONS,
  type WizardState,
} from "@/lib/campaign";
import {
  buttonClasses,
  cardClass,
  friendlyGenerationError,
  inputClass,
  labelClass,
} from "@/lib/ui";

interface BudgetStepProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onApprove: () => void;
  onBack: () => void;
  approving: boolean;
}

function formatMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function BudgetStep({
  state,
  update,
  onApprove,
  onBack,
  approving,
}: BudgetStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGetRecommendation() {
    setLoading(true);
    setError(null);
    try {
      const cap = state.userBudgetCap.trim()
        ? Number(state.userBudgetCap)
        : null;

      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "initial",
          industry: state.industry,
          goal: state.goal,
          campaign_length_days: state.campaignLengthDays,
          audience_size_estimate: estimateAudienceSize(state),
          user_budget_cap: cap,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          friendlyGenerationError(
            data,
            "Something went wrong building a budget plan. Please try again.",
          ),
        );
        return;
      }

      update({ budgetResult: data });
    } catch {
      setError("Network error - please try again.");
    } finally {
      setLoading(false);
    }
  }

  const result = state.budgetResult;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Set a budget</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Our AI proposes a realistic spend plan - always as a range, never a
          guarantee.
        </p>
      </div>

      {!result && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Goal</label>
              <select
                value={state.goal}
                onChange={(e) => update({ goal: e.target.value })}
                className={inputClass}
              >
                {GOAL_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Campaign length (days)</label>
              <input
                type="number"
                min={1}
                value={state.campaignLengthDays}
                onChange={(e) =>
                  update({ campaignLengthDays: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Budget cap (optional)</label>
              <input
                type="number"
                min={0}
                placeholder="Leave blank for a recommendation"
                value={state.userBudgetCap}
                onChange={(e) => update({ userBudgetCap: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetRecommendation}
            disabled={loading}
            className={buttonClasses("primary", "md", "self-start")}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
            {loading ? "Building plan..." : "Get recommendation"}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </>
      )}

      {result && (
        <div className={`${cardClass} p-5 flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-primary" />
              Recommended plan
            </h3>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                result.mode_recommendation === "auto_manage_eligible"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {result.mode_recommendation === "auto_manage_eligible"
                ? "Auto-manage eligible"
                : "Suggestion only"}
            </span>
          </div>

          {result.warning && (
            <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
              {result.warning}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted px-4 py-3">
              <div className="text-xs text-muted-foreground">Total budget</div>
              <div className="font-semibold text-lg">
                {formatMoney(result.budget_range_total[0])} -{" "}
                {formatMoney(result.budget_range_total[1])}
              </div>
            </div>
            <div className="rounded-xl bg-muted px-4 py-3">
              <div className="text-xs text-muted-foreground">Daily spend</div>
              <div className="font-semibold text-lg">
                {formatMoney(result.daily_spend_range[0])} -{" "}
                {formatMoney(result.daily_spend_range[1])}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">
              Platform split
            </div>
            <div className="flex flex-col gap-2.5">
              {result.platform_split.map((p) => (
                <div key={p.platform} className="flex items-center gap-3">
                  <span className="text-sm w-28 shrink-0 truncate">
                    {p.platform}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
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
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.reasoning}
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => update({ budgetResult: null })}
              className={buttonClasses("outline", "md")}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={approving}
              className={buttonClasses("primary", "md")}
            >
              {approving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {approving ? "Saving..." : "Approve"}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className={buttonClasses("ghost", "md")}
        >
          Back
        </button>
      </div>
    </div>
  );
}
