import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonClasses } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center gap-4 bg-grid">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        We couldn&apos;t find what you were looking for - it may have been
        moved, deleted, or never existed.
      </p>
      <Link href="/" className={buttonClasses("primary", "md", "mt-2")}>
        Back to home
      </Link>
    </main>
  );
}
