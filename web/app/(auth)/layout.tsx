import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-full flex flex-col bg-zinc-50">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900">
          Credit Card Hacker
        </Link>
        <Link
          href="/pricing"
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
        >
          Pricing
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </div>
    </main>
  );
}
