import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center gap-6">
      <h1 className="text-4xl font-semibold tracking-tight max-w-2xl">
        Plan your next ad campaign with an AI strategist
      </h1>
      <p className="text-neutral-600 max-w-xl">
        Answer a few questions about your product and audience. Creative
        Strategist writes ad-ready descriptions and a realistic budget plan in
        minutes.
      </p>
      <div className="flex gap-3">
        <Link
          href="/wizard"
          className="bg-neutral-900 text-white rounded-md px-5 py-2.5 text-sm font-medium hover:bg-neutral-800"
        >
          Start a campaign
        </Link>
        <Link
          href="/signup"
          className="border border-neutral-300 rounded-md px-5 py-2.5 text-sm font-medium hover:bg-neutral-50"
        >
          Create an account
        </Link>
      </div>
    </main>
  );
}
