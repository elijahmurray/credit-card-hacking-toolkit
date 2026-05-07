import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-full flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-zinc-900">
          Credit Card Hacker
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          AI-powered credit card churning. Picks your next card, hits min spend,
          decides cancel or keep, hunts elevated offers.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Get started — free
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            See pricing →
          </Link>
        </div>
        <p className="mt-12 text-xs text-zinc-500">
          Skeleton. Landing copy + pricing page + chat UI under construction.
        </p>
      </div>
    </main>
  );
}
