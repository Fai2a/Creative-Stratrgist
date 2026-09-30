"use client";

import { useState } from "react";
import Link from "next/link";
import { initializePaddle } from "@paddle/paddle-js";
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
  userId,
  userEmail,
}: {
  isLoggedIn: boolean;
  isPro: boolean;
  userId: string | null;
  userEmail: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
    if (!token || !priceId) {
      setError("Billing isn't configured yet. Please try again later.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const paddle = await initializePaddle({
        token,
        environment:
          process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
            ? "production"
            : "sandbox",
      });

      if (!paddle) {
        setError("Something went wrong starting checkout. Please try again.");
        return;
      }

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: userEmail ? { email: userEmail } : undefined,
        customData: userId ? { user_id: userId } : undefined,
        settings: {
          successUrl: `${window.location.origin}/account?checkout=success`,
        },
      });
    } catch {
      setError("Something went wrong starting checkout. Please try again.");
    } finally {
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
              {loading ? "Opening checkout..." : "Upgrade to Pro"}
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
