import Link from "next/link";
import { Check, ImageIcon, Swords, Wand2 } from "lucide-react";
import { buttonClasses, cardClass } from "@/lib/ui";

const ITEMS = [
  {
    icon: Swords,
    title: "Competitor analysis",
    description: "Turn what you know about rivals into a differentiation angle.",
    done: true,
  },
  {
    icon: Wand2,
    title: "Content generation",
    description: "Platform-native ad copy for Meta, Google, and TikTok.",
    done: true,
  },
  {
    icon: ImageIcon,
    title: "Graphics",
    description: "AI-generated ad creatives, coming in a future release.",
    done: false,
  },
];

export default function Phase2Page() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 py-24 gap-10 bg-grid">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Phase 2</h1>
        <p className="text-muted-foreground max-w-md mt-2">
          Two of three Phase 2 features are already live on your campaigns.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl w-full">
        {ITEMS.map(({ icon: Icon, title, description, done }) => (
          <div key={title} className={`${cardClass} p-5 flex flex-col gap-3 relative`}>
            {done && (
              <span className="absolute top-4 right-4 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                done ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <Link href="/dashboard" className={buttonClasses("primary", "md")}>
        Go to My Campaigns
      </Link>
    </main>
  );
}
