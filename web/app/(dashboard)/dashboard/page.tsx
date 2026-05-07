import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard — Credit Card Hacker",
};

interface DashboardLink {
  href: string;
  title: string;
  description: string;
}

const LINKS: ReadonlyArray<DashboardLink> = [
  {
    href: "/chat",
    title: "Chat",
    description: "Ask the agent what card to apply for, run min-spend math, or audit your portfolio.",
  },
  {
    href: "/profile",
    title: "Profile",
    description: "Card history, 5/24 count, Amex once-per-lifetime tracking, goals.",
  },
  {
    href: "/settings",
    title: "Settings",
    description: "Subscription tier, billing portal, account.",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  // Layout already redirected if no user; safe to assume one here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded, full_name")
    .eq("id", user!.id)
    .maybeSingle();

  const greetingName =
    profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Welcome back, {greetingName}.
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {profile?.onboarded
            ? "Pick up where you left off."
            : "Finish your profile to unlock personalized recommendations."}
        </p>
      </header>

      {!profile?.onboarded && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            Your profile isn&apos;t set up yet.
          </p>
          <p className="mt-1 text-sm text-amber-800">
            The agent needs your card history + 5/24 count to recommend cards.
          </p>
          <Link
            href="/onboarding"
            className="mt-3 inline-block rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
          >
            Start profile setup
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400"
          >
            <h2 className="text-sm font-semibold text-zinc-900">{link.title}</h2>
            <p className="mt-1 text-xs text-zinc-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
