import { cardClass } from "@/lib/ui";

export default function DashboardLoading() {
  return (
    <main className="flex-1 px-4 py-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 rounded bg-muted" />
          <div className="h-10 w-36 rounded-lg bg-muted" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${cardClass} p-4 flex items-center gap-4`}>
              <div className="h-14 w-14 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
