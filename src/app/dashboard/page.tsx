import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/campaign";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Campaign[]>();

  return (
    <main className="flex-1 px-4 py-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Campaigns</h1>
          <Link
            href="/wizard"
            className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-neutral-800"
          >
            New Campaign
          </Link>
        </div>

        {!campaigns || campaigns.length === 0 ? (
          <p className="text-sm text-neutral-600">
            You haven&apos;t created a campaign yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-neutral-200 p-4 flex items-center gap-4"
              >
                {c.product_image_url && (
                  <Image
                    src={c.product_image_url}
                    alt={c.product_name}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 object-cover rounded-md border border-neutral-200 shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{c.product_name}</div>
                  <div className="text-sm text-neutral-500">
                    {c.industry} ·{" "}
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-600">
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
