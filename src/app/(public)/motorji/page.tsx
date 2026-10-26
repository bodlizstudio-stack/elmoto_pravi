import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogLiveFilter } from "@/components/catalog-live-filter";
import { ExternalLink } from "@/components/external-link";
import { allSaleBikes, readFilters } from "@/lib/motorcycles";
import { avtoNetUrl, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Motorji za prodajo | Novi in rabljeni motorji",
  description: "Novi in rabljeni motorji pri EL-MOTO. Sproti filtriraj ponudbo po znamki, stanju in ceni ter pošlji povpraševanje.",
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
    <section className="bg-paper py-8 text-ink sm:py-12">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Motorji za prodajo" }]} />
        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="display text-5xl sm:text-6xl">Novi in rabljeni motorji</h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-7 text-ink/70">
              Izberi <strong>Novi</strong> ali <strong>Rabljeni motorji</strong>, klikni na znamko ali vtipkaj model — motorji se filtrirajo takoj.
            </p>
          </div>
          <ExternalLink href={avtoNetUrl} className="inline-flex min-h-11 items-center font-semibold underline decoration-[#ec2336] decoration-2 underline-offset-4">
            Preveri aktualno ponudbo na Avto.net
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
