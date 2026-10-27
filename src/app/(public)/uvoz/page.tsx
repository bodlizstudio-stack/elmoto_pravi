import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Uvoz motorjev po naročilu | EL-MOTO d.o.o.",
  description: "Preverjen uvoz motornih koles po naročilu pri EL-MOTO. Pomagamo pri izbiri, pregledu in uvozu želenega motorja.",
  alternates: { canonical: "/uvoz" },
};

export default function UvozPage() {
  return (
    <div className="bg-[#111216] py-10 text-[#F5F5F5] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Ponudba", href: "/motorji" }, { label: "Uvoz" }]} />
        <p className="kicker mt-4">Ponudba EL-MOTO</p>
        <h1 className="display mt-2.5 text-4xl text-white sm:text-6xl">
          UVOZ PO NAROČILU, KOMISIJSKA PRODAJA IN MENJAVA
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#B9BDC5]">
          Iščeš točno določen model motornega kolesa ali želiš zamenjati oziroma prodati svojega? Pri EL-MOTO stavimo na kakovost, prilagodljivost in oseben pristop – od prvega vprašanja do končne odločitve.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
            <h2 className="display text-2xl text-white">Uvoz po naročilu</h2>
            <p className="mt-2.5 text-[15px] leading-6 text-[#B9BDC5]">
              Iščeš točno določen model? Pomagamo ti poiskati preverjen motor po tvojih željah ter uredimo celoten postopek pregleda, uvoza in dokumentacije.
            </p>
          </div>
          <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
            <h2 className="display text-2xl text-white">Komisijska prodaja</h2>
            <p className="mt-2.5 text-[15px] leading-6 text-[#B9BDC5]">
              Svoj motor prepustiš nam, mi pa poskrbimo za profesionalno predstavitev, oglede in varno prodajo končnemu kupcu.
            </p>
          </div>
          <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
            <h2 className="display text-2xl text-white">Odkup in menjava</h2>
            <p className="mt-2.5 text-[15px] leading-6 text-[#B9BDC5]">
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
