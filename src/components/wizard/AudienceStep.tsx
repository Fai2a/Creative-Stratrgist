import { MapPin, ShieldCheck } from "lucide-react";
import type { Gender, WizardState } from "@/lib/campaign";
import { buttonClasses, inputClass, labelClass } from "@/lib/ui";

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
        <h2 className="text-xl font-semibold tracking-tight">
          Who are you trying to reach?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Basic demographic and location targeting only.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          We deliberately don&apos;t collect sexual orientation, health,
          religion, race, or political data - most ad platforms ban targeting
          on these anyway.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Minimum age</label>
          <input
            type="number"
            min={13}
            max={99}
            value={state.ageMin}
            onChange={(e) => update({ ageMin: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Maximum age</label>
          <input
            type="number"
            min={13}
            max={99}
            value={state.ageMax}
            onChange={(e) => update({ ageMax: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Gender</label>
        <div className="inline-flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ gender: opt.value })}
              className={`px-3.5 py-1.5 rounded-full border text-sm transition ${
                state.gender === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-neutral-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Location</label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="City, region, or country"
            value={state.location}
            onChange={(e) => update({ location: e.target.value })}
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

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
          disabled={!canContinue}
          onClick={onNext}
          className={buttonClasses("primary", "md")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
