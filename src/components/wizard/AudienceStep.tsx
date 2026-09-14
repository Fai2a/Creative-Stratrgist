import type { Gender, WizardState } from "@/lib/campaign";

interface AudienceStepProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "all", label: "All genders" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

export default function AudienceStep({
  state,
  update,
  onNext,
  onBack,
}: AudienceStepProps) {
  const canContinue =
    state.location.trim() && state.ageMin >= 13 && state.ageMax >= state.ageMin;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Who are you trying to reach?</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Basic demographic and location targeting only. We deliberately
          don&apos;t collect sexual orientation, health, religion, race, or
          political data - most ad platforms ban targeting on these anyway.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">
            Minimum age
          </label>
          <input
            type="number"
            min={13}
            max={99}
            value={state.ageMin}
            onChange={(e) => update({ ageMin: Number(e.target.value) })}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">
            Maximum age
          </label>
          <input
            type="number"
            min={13}
            max={99}
            value={state.ageMax}
            onChange={(e) => update({ ageMax: Number(e.target.value) })}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">Gender</label>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ gender: opt.value })}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                state.gender === opt.value
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">
          Location
        </label>
        <input
          type="text"
          placeholder="City, region, or country"
          value={state.location}
          onChange={(e) => update({ location: e.target.value })}
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

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
          disabled={!canContinue}
          onClick={onNext}
          className="bg-neutral-900 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
