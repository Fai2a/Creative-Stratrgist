import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LayoutGrid, Package, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/campaign";
import { buttonClasses, cardClass } from "@/lib/ui";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Campaign[]>();

  return (
    <main className="flex-1 px-4 py-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Campaigns</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {campaigns?.length
                ? `${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`
                : "Plan your first campaign"}
            </p>
          </div>
          <Link href="/wizard" className={buttonClasses("primary", "md")}>
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        </div>

        {!campaigns || campaigns.length === 0 ? (
          <div className={`${cardClass} flex flex-col items-center text-center gap-3 py-16 px-6`}>
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h2 className="font-medium">No campaigns yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start the wizard to build your first AI-guided campaign brief.
            </p>
            <Link href="/wizard" className={buttonClasses("primary", "md", "mt-2")}>
              Start a campaign
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/${c.id}`}
                className={`${cardClass} p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="h-14 w-14 rounded-xl border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {c.product_image_url ? (
                    <Image
                      src={c.product_image_url}
                      alt={c.product_name}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.product_name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {c.industry} · {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary shrink-0">
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
