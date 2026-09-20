"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import type { SubscriptionStatus } from "@/lib/subscription";
import { buttonClasses, cardClass } from "@/lib/ui";

export default function AccountBilling({
  pro,
  campaignCount,
  freeLimit,
  currentPeriodEnd,
  status,
  checkoutStatus,
}: {
  pro: boolean;
  campaignCount: number;
  freeLimit: number;
  currentPeriodEnd: string | null;
  status: SubscriptionStatus;
  checkoutStatus: "success" | "canceled" | null;
}) {
  const router = useRouter();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stripe's webhook lands asynchronously - right after a successful
  // checkout the page can still show "free" for a moment. Poll once via a
  // refresh so it catches up without the user manually reloading.
  useEffect(() => {
    if (checkoutStatus === "success" && !pro) {
      const timer = setTimeout(() => router.refresh(), 2500);
      return () => clearTimeout(timer);
    }
  }, [checkoutStatus, pro, router]);

  async function handleManageSubscription() {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError("Something went wrong opening the billing portal. Please try again.");
        setPortalLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error - please try again.");
      setPortalLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {checkoutStatus === "success" && !pro && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          Payment received - activating your Pro plan, this can take a few
          seconds...
        </p>
      )}
      {checkoutStatus === "success" && pro && (
        <p className="text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-2">
          You&apos;re on Pro. Thanks for upgrading!
        </p>
      )}
      {checkoutStatus === "canceled" && (
        <p className="text-sm bg-neutral-100 text-muted-foreground rounded-lg px-3 py-2">
          Checkout was canceled - no charge was made.
        </p>
      )}

      <div className={`${cardClass} p-6 flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Current plan
            </div>
            <div className="font-semibold text-lg flex items-center gap-1.5 mt-1">
              {pro && <Sparkles className="h-4 w-4 text-primary" />}
              {pro ? "Pro" : "Free"}
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : status === "past_due"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-neutral-100 text-muted-foreground"
            }`}
          >
            {status}
          </span>
        </div>

        {!pro && (
          <p className="text-sm text-muted-foreground">
            {campaignCount} of {freeLimit} campaigns used.
          </p>
        )}

        {pro && currentPeriodEnd && (
          <p className="text-sm text-muted-foreground">
            {status === "canceled"
              ? "Access ends"
              : "Renews"}{" "}
            {new Date(currentPeriodEnd).toLocaleDateString()}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {pro ? (
          <button
            type="button"
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className={buttonClasses("outline", "md", "self-start")}
          >
            {portalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {portalLoading ? "Opening..." : "Manage subscription"}
          </button>
        ) : (
          <Link href="/pricing" className={buttonClasses("primary", "md", "self-start")}>
            Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  );
}
