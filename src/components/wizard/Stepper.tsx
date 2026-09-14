const STEPS = [
  "Mode",
  "Product",
  "Audience",
  "Description",
  "Budget",
  "Summary",
];

export default function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-between w-full max-w-3xl mx-auto mb-10 text-xs">
      {STEPS.map((label, idx) => {
        const step = idx + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <li key={label} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-medium ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : isDone
                    ? "bg-neutral-200 text-neutral-700"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {step}
            </div>
            <span
              className={
                isActive
                  ? "text-neutral-900 font-medium"
                  : "text-neutral-400"
              }
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
