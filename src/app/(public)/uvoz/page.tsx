import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Uvoz motorjev po naročilu | EL-MOTO",
  description: "Preverjen uvoz motornih koles po naročilu pri EL-MOTO. Pomagamo pri izbiri, pregledu in uvozu želenega motorja.",
  alternates: { canonical: "/uvoz" },
};

export default function UvozPage() {
  return (
    <div className="bg-white py-10 text-[#171a1f] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Ponudba", href: "/motorji" }, { label: "Uvoz" }]} />
        <p className="kicker mt-4 uppercase tracking-[0.12em]">Ponudba EL-MOTO</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Uvoz po naročilu, komisijska prodaja in menjava</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#5b616b]">
          Iščeš točno določen model motornega kolesa ali želiš zamenjati oziroma prodati svojega? Pri EL-MOTO stavimo na kakovost, prilagodljivost in oseben pristop – od prvega vprašanja do končne odločitve.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[14px] border border-[#e2e5e9] bg-[#f7f8f9] p-6">
            <h2 className="text-xl font-semibold text-[#171a1f]">Uvoz po naročilu</h2>
            <p className="mt-2 text-[15px] leading-6 text-[#5b616b]">
              Iščeš točno določen model? Pomagamo ti poiskati preverjen motor po tvojih željah ter uredimo celoten postopek pregleda, uvoza in dokumentacije.
            </p>
          </div>
          <div className="rounded-[14px] border border-[#e2e5e9] bg-[#f7f8f9] p-6">
            <h2 className="text-xl font-semibold text-[#171a1f]">Komisijska prodaja</h2>
            <p className="mt-2 text-[15px] leading-6 text-[#5b616b]">
              Svoj motor prepustiš nam, mi pa poskrbimo za profesionalno predstavitev, oglede in varno prodajo končnemu kupcu.
            </p>
          </div>
          <div className="rounded-[14px] border border-[#e2e5e9] bg-[#f7f8f9] p-6">
            <h2 className="text-xl font-semibold text-[#171a1f]">Odkup in menjava</h2>
            <p className="mt-2 text-[15px] leading-6 text-[#5b616b]">
              Zamenjaj svoj trenutni motor za drugega. Nudimo možnost odkupa oziroma doplačila ob menjavi za novega ali drugega rabljenega iz naše ponudbe.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/kontakt?vrsta=PURCHASE&model=Uvoz%20po%20naro%C4%8Dilu" className="btn btn-primary">
            Pošlji povpraševanje
          </Link>
          <a href={`tel:${site.phoneTel}`} className="btn btn-secondary">
            Pokliči {site.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
