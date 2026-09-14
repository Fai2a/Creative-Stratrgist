import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-neutral-200">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          Creative Strategist
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/phase2" className="text-sm text-neutral-600 hover:text-neutral-900">
            Phase 2
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-neutral-600 hover:text-neutral-900">
                My Campaigns
              </Link>
              <Link
                href="/wizard"
                className="text-sm bg-neutral-900 text-white rounded-md px-3 py-1.5 hover:bg-neutral-800"
              >
                New Campaign
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-neutral-900 text-white rounded-md px-3 py-1.5 hover:bg-neutral-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
