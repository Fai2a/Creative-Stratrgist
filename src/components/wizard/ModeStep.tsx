import type { CampaignMode } from "@/lib/campaign";

interface ModeStepProps {
  mode: CampaignMode | null;
  onChange: (mode: CampaignMode) => void;
  onNext: () => void;
}

export default function ModeStep({ mode, onChange, onNext }: ModeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Who is this campaign for?</h2>
        <p className="text-sm text-neutral-600 mt-1">
          This shapes how we frame the product description and audience.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("brand")}
          className={`text-left rounded-lg border p-5 transition ${
            mode === "brand"
              ? "border-neutral-900 ring-1 ring-neutral-900"
              : "border-neutral-200 hover:border-neutral-400"
          }`}
        >
          <div className="font-medium mb-1">A specific brand</div>
          <p className="text-sm text-neutral-600">
            I&apos;m planning this for a known product or brand with existing
            positioning.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange("general")}
          className={`text-left rounded-lg border p-5 transition ${
            mode === "general"
              ? "border-neutral-900 ring-1 ring-neutral-900"
              : "border-neutral-200 hover:border-neutral-400"
          }`}
        >
          <div className="font-medium mb-1">A general audience</div>
          <p className="text-sm text-neutral-600">
            I want to explore a product concept for a broader, less-defined
            audience.
          </p>
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!mode}
          onClick={onNext}
          className="bg-neutral-900 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
