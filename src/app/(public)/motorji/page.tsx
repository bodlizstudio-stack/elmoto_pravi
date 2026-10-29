import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogLiveFilter } from "@/components/catalog-live-filter";
import { ExternalLink } from "@/components/external-link";
import { allSaleBikes, readFilters } from "@/lib/motorcycles";
import { avtoNetUrl, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Motorji za prodajo | Novi in rabljeni motorji",
  description: "Novi in rabljeni motorji pri EL-MOTO d.o.o. Sproti filtriraj ponudbo po znamki, stanju in ceni ter pošlji povpraševanje.",
  alternates: { canonical: "/motorji" },
};

export default async function MotorcyclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = readFilters(params);
  const bikes = await allSaleBikes();
  const canonical = new URL("/motorji", siteUrl());

  return (
    <section className="bg-[#F6F6F4] py-10 text-[#16181C] sm:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Motorji za prodajo" }]} />
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="kicker">Aktualna ponudba</p>
            <h1 className="display mt-2.5 text-5xl text-[#16181C] sm:text-6xl">NOVI IN RABLJENI MOTORJI</h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#5B616B]">
              Izberi <strong className="text-[#16181C]">Novi</strong> ali <strong className="text-[#16181C]">Rabljeni motorji</strong>, klikni na znamko ali vtipkaj model — motorji se filtrirajo takoj.
            </p>
          </div>
          <ExternalLink
            href={avtoNetUrl}
            className="btn btn-secondary self-start sm:self-auto"
          >
            Celotna ponudba na Avto.net ↗
          </ExternalLink>
        </div>

        <CatalogLiveFilter
          bikes={bikes}
          initial={{
            condition: filters.condition,
            brand: filters.brand,
            model: filters.model,
            category: filters.category,
            sort: filters.sort,
          }}
        />
      </div>
      <link rel="canonical" href={canonical.toString()} />
    </section>
  );
}
