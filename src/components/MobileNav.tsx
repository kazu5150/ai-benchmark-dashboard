"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "📊" },
  { href: "/compare", label: "Compare", icon: "⚡" },
  { href: "/benchmarks", label: "Benchmarks", icon: "📋" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? "text-text" : "text-text-sub"
              }`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
