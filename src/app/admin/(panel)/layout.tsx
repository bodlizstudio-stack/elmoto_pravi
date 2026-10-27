import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { Logo } from "@/components/logo";
import { logout } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="admin-shell min-h-dvh bg-[#f6f6f4] text-[#16181c]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" aria-label="EL-MOTO administracija" className="inline-flex items-center">
              <Logo className="h-8 w-auto" theme="light" />
            </Link>
            <span className="rounded-md bg-[#16181c] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Admin
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <span className="hidden max-w-48 truncate text-[#4e555d] sm:inline">{user.email}</span>
            <Link className="btn btn-secondary min-h-10 px-3.5 py-2 text-sm" href="/" target="_blank">
              Poglej spletno stran ↗
            </Link>
            <form action={logout}>
              <button className="btn btn-secondary min-h-10 px-3.5 py-2 text-sm">Odjava</button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>
      <div className="mx-auto w-full max-w-6xl px-5 py-6">{children}</div>
    </div>
  );
}
