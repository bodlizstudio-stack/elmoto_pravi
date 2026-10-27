import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Moto oprema | EL-MOTO d.o.o.",
  description: "Moto oprema in dodatki pri EL-MOTO d.o.o.",
  alternates: { canonical: "/oprema" },
};

export default function OpremaPage() {
  return (
    <div className="bg-[#111216] py-10 text-[#F5F5F5] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Ponudba", href: "/motorji" }, { label: "Moto oprema" }]} />
        <p className="kicker mt-4">Ponudba EL-MOTO</p>
        <h1 className="display mt-2.5 text-4xl text-white sm:text-6xl">MOTO OPREMA</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#B9BDC5]">
          Ponudba moto opreme in dodatkov bo kmalu objavljena na spletni strani. Za preverjanje zaloge in svetovanje nas kontaktiraj.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/kontakt?vrsta=GENERAL&model=Moto%20oprema" className="btn btn-primary">
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
