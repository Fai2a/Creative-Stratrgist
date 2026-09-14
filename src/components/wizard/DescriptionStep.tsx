"use client";

import { useState } from "react";
import { buildAudienceSummary, type WizardState } from "@/lib/campaign";
import type { DescriptionMode, DescriptionResponse } from "@/lib/schemas";

interface DescriptionStepProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DescriptionStep({
  state,
  update,
  onNext,
  onBack,
}: DescriptionStepProps) {
  const hasRawDescription = state.rawDescription.trim().length > 0;
  const [mode, setMode] = useState<DescriptionMode>(
    hasRawDescription ? "polish" : "generate",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<DescriptionResponse["description_options"]>(
    [],
  );

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setOptions([]);
    try {
      const res = await fetch("/api/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: state.productName,
          industry: state.industry,
          usp: state.usp,
          raw_description: hasRawDescription ? state.rawDescription : null,
          mode,
          audience_summary: buildAudienceSummary(state),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Something went wrong generating descriptions. Please try again.");
        return;
      }

      if (data.error === "missing_usp") {
        setError(
          "Add a unique selling point on the previous step before generating a description.",
        );
        return;
      }

      setOptions(data.description_options ?? []);
    } catch {
      setError("Network error - please try again.");
    } finally {
      setLoading(false);
    }
  }

  const modeOptions: { value: DescriptionMode; label: string }[] = [
    ...(hasRawDescription
      ? ([
          { value: "keep", label: "Keep as-is" },
          { value: "polish", label: "Polish" },
          { value: "rewrite", label: "Rewrite" },
        ] as const)
      : []),
    { value: "generate", label: "Generate for me" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Choose your description</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Claude writes a few ad-ready options based on your USP.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">
          How should we handle your description?
        </label>
        <div className="flex flex-wrap gap-2">
          {modeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                mode === opt.value
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="self-start bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate options"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {options.length > 0 && (
        <div className="flex flex-col gap-3">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => update({ chosenDescription: opt.text })}
              className={`text-left rounded-lg border p-4 transition ${
                state.chosenDescription === opt.text
                  ? "border-neutral-900 ring-1 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                {opt.tone}
              </div>
              <p className="text-sm">{opt.text}</p>
            </button>
          ))}
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
        <button
          type="button"
          disabled={!state.chosenDescription}
          onClick={onNext}
          className="bg-neutral-900 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
