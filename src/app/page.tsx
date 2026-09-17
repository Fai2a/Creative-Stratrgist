import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  PenLine,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { buttonClasses, cardClass, sectionEyebrowClass } from "@/lib/ui";

const FEATURES = [
  {
    icon: Target,
    title: "Guided audience builder",
    description:
      "Age, gender, and location targeting - built around what Meta, Google, and TikTok actually allow.",
  },
  {
    icon: PenLine,
    title: "AI-written descriptions",
    description:
      "Keep, polish, rewrite, or generate from scratch - always grounded in your product's real USP.",
  },
  {
    icon: Wallet,
    title: "Honest budget plans",
    description:
      "Ranges, not false promises. A realistic spend plan with platform split and clear reasoning.",
  },
  {
    icon: LayoutGrid,
    title: "Platform-native ad copy",
    description:
      "Meta, Google, and TikTok copy that respects each platform's real character limits.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-grid">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/60 to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-guided campaign planning
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl text-balance">
            Plan your next ad campaign with an{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI strategist
            </span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-xl text-balance">
            Answer a few questions about your product and audience. Creative
            Strategist writes ad-ready descriptions and a realistic budget
            plan in minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link href="/wizard" className={buttonClasses("primary", "lg")}>
              Start a campaign
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup" className={buttonClasses("outline", "lg")}>
              Create an account
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-24 sm:pb-32">
        <div className="text-center mb-12">
          <p className={sectionEyebrowClass}>What you get</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2">
            Everything for a first campaign brief
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className={`${cardClass} p-6 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
