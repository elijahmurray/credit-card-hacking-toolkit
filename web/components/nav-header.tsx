"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignoutButton } from "@/components/signout-button";

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/chat", label: "Chat" },
  { href: "/pricing", label: "Pricing" },
  { href: "/settings", label: "Settings" },
];

export function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-zinc-900"
        >
          Credit Card Hacker
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <SignoutButton />
        </nav>
      </div>
    </header>
  );
}
