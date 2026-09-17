import { Building2, Users, Check } from "lucide-react";
import type { CampaignMode } from "@/lib/campaign";
import { buttonClasses } from "@/lib/ui";

interface ModeStepProps {
  mode: CampaignMode | null;
  onChange: (mode: CampaignMode) => void;
  onNext: () => void;
}

const OPTIONS: {
  value: CampaignMode;
  icon: typeof Building2;
  title: string;
  description: string;
}[] = [
  {
    value: "brand",
    icon: Building2,
    title: "A specific brand",
    description:
      "I'm planning this for a known product or brand with existing positioning.",
  },
  {
    value: "general",
    icon: Users,
    title: "A general audience",
    description:
      "I want to explore a product concept for a broader, less-defined audience.",
  },
];

export default function ModeStep({ mode, onChange, onNext }: ModeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Who is this campaign for?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This shapes how we frame the product description and audience.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {OPTIONS.map(({ value, icon: Icon, title, description }) => {
          const selected = mode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`relative text-left rounded-xl border p-5 transition-all duration-150 ${
                selected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-neutral-300 hover:shadow-sm"
              }`}
            >
              {selected && (
                <span className="absolute top-4 right-4 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="font-medium mb-1">{title}</div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!mode}
          onClick={onNext}
          className={buttonClasses("primary", "md")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
