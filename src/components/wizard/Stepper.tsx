import { Check } from "lucide-react";

const STEPS = [
  "Mode",
  "Product",
  "Audience",
  "Description",
  "Budget",
  "Summary",
];

export default function Stepper({ current }: { current: number }) {
  const progressPct = ((current - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 sm:mb-12">
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />

        <ol className="relative flex items-start justify-between text-xs">
          {STEPS.map((label, idx) => {
            const step = idx + 1;
            const isActive = step === current;
            const isDone = step < current;
            return (
              <li
                key={label}
                className="flex-1 min-w-0 flex flex-col items-center gap-2"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ring-4 ring-background transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-110"
                      : isDone
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-neutral-400"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : step}
                </div>
                <span
                  className={`hidden sm:block truncate max-w-full ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="sm:hidden text-center text-sm font-medium text-foreground mt-3">
        Step {current} of {STEPS.length}: {STEPS[current - 1]}
      </p>
    </div>
  );
}
