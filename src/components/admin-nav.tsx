"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Ponudba motorjev", exact: true },
  { href: "/admin/motorji/nov", label: "+ Dodaj motor", exact: false },
  { href: "/admin/vsebina", label: "Urejanje naslovne strani & podatkov", exact: false },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-5 pb-3" aria-label="Administracija">
      {links.map((item) => {
        const isActive = item.exact
          ? pathname === item.href || (pathname.startsWith("/admin/motorji/") && pathname !== "/admin/motorji/nov")
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-[10px] border px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "border-[#E31B2B] bg-[#E31B2B] text-white shadow-xs"
                : "border-black/12 bg-[#f8f9fa] text-[#16181c] hover:border-black/30 hover:bg-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
