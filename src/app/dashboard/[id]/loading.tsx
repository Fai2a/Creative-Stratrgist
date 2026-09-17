import { cardClass } from "@/lib/ui";

export default function CampaignDetailLoading() {
  return (
    <main className="flex-1 px-4 py-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-pulse">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className={`${cardClass} p-6 flex flex-col gap-4`}>
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 flex flex-col gap-2 justify-center">
              <div className="h-5 w-1/2 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          </div>
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      </div>
    </main>
  );
}
