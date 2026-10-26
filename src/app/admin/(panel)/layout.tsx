import Link from "next/link";
import { Logo } from "@/components/logo";
import { logout } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

const links = [
  ["/admin", "Motorji"],
  ["/admin/motorji/nov", "Dodaj motor"],
  ["/admin/motorji/nov?mode=avtonet", "Uvozi motor iz Avto.net"],
  ["/admin/geslo", "Geslo"],
  ["/admin/najem", "Najem"],
  ["/admin/povprasevanja", "Povpraševanja"],
  ["/admin/vsebina", "Vsebina"],
  ["/admin/uvoz", "CSV/JSON uvoz"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="admin-shell min-h-dvh bg-[#f6f6f4] text-[#16181c]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link href="/admin" aria-label="EL-MOTO administracija" className="inline-flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="max-w-48 truncate">{user.email}</span>
            <form action={logout}>
              <button className="btn btn-secondary min-h-11">Odjava</button>
            </form>
            <Link className="btn btn-secondary min-h-11" href="/">
              Na stran
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-5 pb-3" aria-label="Administracija">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="shrink-0 rounded-[10px] border border-black/10 bg-white px-3 py-2 text-sm">
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto w-full max-w-6xl px-5 py-6">{children}</div>
    </div>
  );
}
