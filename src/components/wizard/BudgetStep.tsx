"use client";

import { useState } from "react";
import { estimateAudienceSize, type WizardState } from "@/lib/campaign";

interface BudgetStepProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onApprove: () => void;
  onBack: () => void;
  approving: boolean;
}

const GOAL_OPTIONS = [
  { value: "awareness", label: "Awareness" },
  { value: "traffic", label: "Traffic" },
  { value: "leads", label: "Leads" },
  { value: "sales", label: "Sales" },
];

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

      if (!res.ok) {
        setError("Something went wrong building a budget plan. Please try again.");
        return;
      }

      const data = await res.json();
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
        <h2 className="text-xl font-semibold">Set a budget</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Claude proposes a realistic spend plan - always as a range, never a
          guarantee.
        </p>
      </div>

      {!result && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">
                Goal
              </label>
              <select
                value={state.goal}
                onChange={(e) => update({ goal: e.target.value })}
                className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
              >
                {GOAL_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">
                Campaign length (days)
              </label>
              <input
                type="number"
                min={1}
                value={state.campaignLengthDays}
                onChange={(e) =>
                  update({ campaignLengthDays: Number(e.target.value) })
                }
                className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">
                Budget cap (optional)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Leave blank for a recommendation"
                value={state.userBudgetCap}
                onChange={(e) => update({ userBudgetCap: e.target.value })}
                className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetRecommendation}
            disabled={loading}
            className="self-start bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Building plan..." : "Get recommendation"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </>
      )}

      {result && (
        <div className="rounded-lg border border-neutral-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Recommended plan</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
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
            <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2">
              {result.warning}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-500">Total budget</div>
              <div className="font-medium">
                {formatMoney(result.budget_range_total[0])} -{" "}
                {formatMoney(result.budget_range_total[1])}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Daily spend</div>
              <div className="font-medium">
                {formatMoney(result.daily_spend_range[0])} -{" "}
                {formatMoney(result.daily_spend_range[1])}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 mb-2">
              Platform split
            </div>
            <div className="flex flex-col gap-2">
              {result.platform_split.map((p) => (
                <div key={p.platform} className="flex items-center gap-3">
                  <span className="text-sm w-24 shrink-0">{p.platform}</span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-neutral-900"
                      style={{ width: `${Math.min(100, p.pct)}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-600 w-10 text-right">
                    {p.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-neutral-600">{result.reasoning}</p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => update({ budgetResult: null })}
              className="border border-neutral-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={approving}
              className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {approving ? "Saving..." : "Approve"}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Back
        </button>
      </div>
    </div>
  );
}
