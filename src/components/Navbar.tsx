import Link from "next/link";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isPro, type Subscription } from "@/lib/subscription";
import SignOutButton from "@/components/SignOutButton";
import { buttonClasses } from "@/lib/ui";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pro = false;
  if (user) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<Subscription>();
    pro = isPro(subscription ?? null);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight whitespace-nowrap shrink-0"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-sm shadow-primary/30">
            <Sparkles className="h-4 w-4" strokeWidth={2.25} />
          </span>
          Creative Strategist
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-1 gap-y-2">
          <Link
            href="/phase2"
            className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition"
          >
            Phase 2
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition"
              >
                My Campaigns
              </Link>
              {pro ? (
                <Link
                  href="/account"
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/15 transition"
                >
                  <Sparkles className="h-3 w-3" />
                  Pro
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition"
                >
                  Upgrade
                </Link>
              )}
              <Link href="/wizard" className={buttonClasses("primary", "sm", "ml-1")}>
                New Campaign
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition"
              >
                Log in
              </Link>
              <Link href="/signup" className={buttonClasses("primary", "sm", "ml-1")}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
