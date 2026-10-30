import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ExternalLink } from "@/components/external-link";
import { KoveShowcase } from "@/components/kove-showcase";
import { getPublishedKoveModels } from "@/lib/kove";
import { koveCatalogUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KOVE | EL-MOTO d.o.o.",
  description: "EL-MOTO d.o.o. je pooblaščeni prodajalec motociklov KOVE. Spoznaj izbrane modele in pošlji povpraševanje.",
  alternates: { canonical: "/kove" },
};

export default async function KovePage() {
  const models = await getPublishedKoveModels();

  return (
    <section className="bg-[#F6F6F4] py-10 text-[#16181C] sm:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "KOVE" }]} />
        <p className="kicker mt-4">KOVE pri EL-MOTO</p>
        <h1 className="display mt-2.5 max-w-3xl text-4xl text-[#16181C] sm:text-6xl">
          POOBLAŠČENI PRODAJALEC MOTOCIKLOV KOVE
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#5B616B]">
          Spoznaj motocikle KOVE in poišči model za svoj način vožnje. Pri EL-MOTO ti pomagamo pri izbiri ter preverimo ponudbo in dobavljivost.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a className="btn btn-secondary w-full sm:w-auto" href="#modeli">
            Razišči modele KOVE
          </a>
          <Link className="btn btn-primary w-full sm:w-auto" href="/kontakt?vrsta=PURCHASE&model=KOVE">
            Povprašaj za KOVE
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-[#5B616B]">
          Spodnji modeli so predstavitev znamke po uradnem katalogu. Niso zaloga EL-MOTO. Cene in pogoje preveriš pri nas.
        </p>

        <div id="modeli" className="mt-10 scroll-mt-24">
          {models.length ? (
            <KoveShowcase models={models} />
          ) : (
            <p className="rounded-[14px] border border-[#E2E5E9] bg-white p-6 leading-7 text-[#5B616B]">
              Kartice modelov bodo objavljene, ko bodo na voljo fotografije točno teh modelov.
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ExternalLink href={koveCatalogUrl} className="btn btn-secondary w-full sm:w-auto">
            Uradni katalog KOVE ↗
          </ExternalLink>
          <Link className="btn btn-secondary w-full sm:w-auto" href="/motorji?brand=KOVE">
            Objavljeni motorji KOVE
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5B616B]">
          Povezava na objavljene motorje pokaže vozila, ki so vpisana v ponudbi na tej strani. Katalog zgoraj ni seznam zaloge.
        </p>
      </div>
    </section>
  );
}
