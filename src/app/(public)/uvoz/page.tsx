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
        <h1 className="display mt-2 text-4xl sm:text-5xl">Uvoz motorjev po naročilu</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#5b616b]">
          Iščeš specifičen model motornega kolesa, ki ga trenutno ni v naši zalogi? Pri EL-MOTO poskrbimo za varen in preverjen
          uvoz motorja po naročilu — od iskanja preverjenega vozila, pregleda stanja in zgodovine do ureditve dokumentacije in
          registracije v Sloveniji.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/kontakt?vrsta=PURCHASE&model=Uvoz%20po%20naro%C4%8Dilu" className="btn btn-primary">
            Pošlji povpraševanje za uvoz
          </Link>
          <a href={`tel:${site.phoneTel}`} className="btn btn-secondary">
            Pokliči {site.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
