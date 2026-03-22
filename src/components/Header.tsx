"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/compare", label: "Compare" },
  { href: "/benchmarks", label: "Benchmarks" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-sm">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-14 flex items-center gap-8">
        <Link href="/" className="font-semibold text-base whitespace-nowrap">
          日本語AIベンチマーク
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-150 ${
                  isActive
                    ? "text-text bg-surface"
                    : "text-text-sub hover:text-text hover:bg-surface/50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
