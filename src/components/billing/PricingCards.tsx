"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, Sparkles } from "lucide-react";
import { FREE_CAMPAIGN_LIMIT } from "@/lib/subscription";
import { buttonClasses, cardClass } from "@/lib/ui";

const FREE_FEATURES = [
  `${FREE_CAMPAIGN_LIMIT} campaigns`,
  "AI descriptions & budget planning",
  "Content generation & competitor analysis",
];

const PRO_FEATURES = [
  "Unlimited campaigns",
  "AI descriptions & budget planning",
  "Content generation & competitor analysis",
  "Priority support",
];

export default function PricingCards({
  isLoggedIn,
  isPro,
}: {
  isLoggedIn: boolean;
  isPro: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError("Something went wrong starting checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error - please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={`${cardClass} p-6 flex flex-col gap-4`}>
          <div>
            <h2 className="font-medium">Free</h2>
            <p className="text-2xl font-semibold mt-1">$0</p>
          </div>
          <ul className="flex flex-col gap-2 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-neutral-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${cardClass} p-6 flex flex-col gap-4 border-primary/30 ring-1 ring-primary/20 relative`}>
          <span className="absolute -top-3 left-6 text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-primary to-accent text-white px-2.5 py-1 rounded-full">
            Recommended
          </span>
          <div>
            <h2 className="font-medium flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Pro
            </h2>
            <p className="text-2xl font-semibold mt-1">
              $9<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <span className={buttonClasses("outline", "md", "justify-center pointer-events-none")}>
              Current plan
            </span>
          ) : isLoggedIn ? (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className={buttonClasses("primary", "md")}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Redirecting..." : "Upgrade to Pro"}
            </button>
          ) : (
            <Link href="/signup?redirectTo=/pricing" className={buttonClasses("primary", "md")}>
              Sign up to upgrade
            </Link>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
