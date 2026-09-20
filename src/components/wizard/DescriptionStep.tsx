"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { buildAudienceSummary, type WizardState } from "@/lib/campaign";
import type { DescriptionMode, DescriptionResponse } from "@/lib/schemas";
import { buttonClasses, friendlyGenerationError, labelClass } from "@/lib/ui";

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
        setError(
          friendlyGenerationError(
            data,
            "Something went wrong generating descriptions. Please try again.",
          ),
        );
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
        <h2 className="text-xl font-semibold tracking-tight">
          Choose your description
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Our AI writes a few ad-ready options based on your USP.
        </p>
      </div>

      {hasRawDescription && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            How should we handle your description?
          </label>
          <div className="inline-flex flex-wrap gap-2">
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={`px-3.5 py-1.5 rounded-full border text-sm transition ${
                  mode === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-neutral-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className={buttonClasses("primary", "md", "self-start")}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "Generating..." : "Generate options"}
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {options.length > 0 && (
        <div className="flex flex-col gap-3">
          {options.map((opt, idx) => {
            const selected = state.chosenDescription === opt.text;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => update({ chosenDescription: opt.text })}
                className={`relative text-left rounded-xl border p-4 transition-all duration-150 ${
                  selected
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border hover:border-neutral-300 hover:shadow-sm"
                }`}
              >
                {selected && (
                  <span className="absolute top-3.5 right-3.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-1.5 pr-6">
                  {opt.tone}
                </div>
                <p className="text-sm leading-relaxed pr-6">{opt.text}</p>
              </button>
            );
          })}
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
        <button
          type="button"
          disabled={!state.chosenDescription}
          onClick={onNext}
          className={buttonClasses("primary", "md")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
