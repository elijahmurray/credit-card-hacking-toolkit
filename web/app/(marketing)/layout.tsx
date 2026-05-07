import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-full flex flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-900"
          >
            Credit Card Hacker
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="px-3 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              Pricing
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Credit Card Hacker</span>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-zinc-900">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-zinc-900">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
