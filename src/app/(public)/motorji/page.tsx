import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ExternalLink } from "@/components/external-link";
import { FilterShell } from "@/components/filter-shell";
import { MotoCard } from "@/components/moto-card";
import { filterOptions, listSaleBikes, readFilters } from "@/lib/motorcycles";
import { avtoNetUrl, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Motorji za prodajo",
  description: "Novi in rabljeni motorji pri EL-MOTO. Filtriraj ponudbo in pošlji povpraševanje.",
  alternates: { canonical: "/motorji" },
};

export default async function MotorcyclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = readFilters(params);
  const [result, options] = await Promise.all([listSaleBikes(filters), filterOptions()]);
  const canonical = new URL("/motorji", siteUrl());

  return (
    <section className="bg-paper py-8 text-ink sm:py-12">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Motorji za prodajo" }]} />
        <h1 className="display mt-4 text-5xl sm:text-6xl">Motorji za prodajo</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-7 text-ink/70">
          Preglej motorje, ki so trenutno objavljeni. Cena je navedena samo, kadar je potrjena.
        </p>
        <ExternalLink href={avtoNetUrl} className="mt-4 inline-flex min-h-11 items-center font-semibold underline">
          Preveri aktualno ponudbo na Avto.net
        </ExternalLink>
        <div className="mt-6">
          <p id="stanje-motorja" className="text-sm font-semibold">
            Stanje
          </p>
          <div role="group" aria-labelledby="stanje-motorja" className="mt-2 flex flex-wrap gap-2">
            {[
              { id: "", label: "Vsi" },
              { id: "USED", label: "Rabljeni" },
              { id: "NEW", label: "Novi" },
            ].map((tab) => {
              const selected = filters.condition === tab.id;
              return (
                <Link
                  key={tab.label}
                  href={conditionHref(params, tab.id)}
                  aria-current={selected ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-[10px] border px-4 text-sm font-semibold ${selected ? "border-ink bg-ink text-white" : "border-black/15 bg-white text-ink"}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold">Število rezultatov: {result.total}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
          <FilterShell>
            <form method="get" action="/motorji" className="grid gap-3 rounded-[12px] border border-black/10 bg-white p-4">
              <h2 className="hidden text-lg font-semibold lg:block">Filtri</h2>
              <Select name="brand" label="Znamka" value={filters.brand} options={options.brands} />
              <Field name="model" label="Model" defaultValue={filters.model} />
              <div className="grid grid-cols-2 gap-2">
                <Field name="priceMin" label="Cena od" defaultValue={filters.priceMin} type="number" />
                <Field name="priceMax" label="Cena do" defaultValue={filters.priceMax} type="number" />
                <Field name="yearMin" label="Letnik od" defaultValue={filters.yearMin} type="number" />
                <Field name="yearMax" label="Letnik do" defaultValue={filters.yearMax} type="number" />
              </div>
              <Field name="mileageMax" label="Kilometri do" defaultValue={filters.mileageMax} type="number" />
              <div className="grid grid-cols-2 gap-2">
                <Field name="ccMin" label="Prostornina od" defaultValue={filters.ccMin} type="number" />
                <Field name="ccMax" label="Prostornina do" defaultValue={filters.ccMax} type="number" />
              </div>
              <Select name="category" label="Kategorija" value={filters.category} options={options.categories} />
              <label className="field">
                <span>Stanje</span>
                <select name="condition" defaultValue={filters.condition}>
                  <option value="">Vsa</option>
                  <option value="NEW">Novo</option>
                  <option value="USED">Rabljeno</option>
                </select>
              </label>
              <label className="field">
                <span>Razpoložljivost</span>
                <select name="availability" defaultValue={filters.availability}>
                  <option value="">Trenutna ponudba</option>
                  <option value="AVAILABLE">Na voljo</option>
                  <option value="RESERVED">Rezervirano</option>
                  <option value="SOLD">Prodano</option>
                  <option value="all">Vsa javna stanja</option>
                </select>
              </label>
              {options.licenses.length ? (
                <Select name="license" label="Kategorija dovoljenja" value={filters.license} options={options.licenses} />
              ) : null}
              <label className="field">
                <span>Razvrsti</span>
                <select name="sort" defaultValue={filters.sort}>
                  <option value="newest">Najnovejše</option>
                  <option value="price_asc">Cena, naraščajoče</option>
                  <option value="price_desc">Cena, padajoče</option>
                  <option value="year_desc">Letnik, novejši</option>
                  <option value="year_asc">Letnik, starejši</option>
                  <option value="mileage_asc">Najmanj kilometrov</option>
                </select>
              </label>
              <button className="btn btn-dark w-full">Prikaži motorje</button>
              <Link className="text-center text-sm underline" href="/motorji">
                Ponastavi
              </Link>
            </form>
          </FilterShell>
          <div>
            {result.items.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((bike) => (
                  <MotoCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="border border-black/10 bg-white p-6">
                <h2 className="display text-4xl">Ni zadetkov</h2>
                <p className="mt-3 leading-7">Za izbrane filtre ni objavljenih motorjev. Odstrani filtre ali preveri ponudbo na Avto.net.</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link className="btn btn-secondary w-full sm:w-auto" href="/motorji">
                    Odstrani filtre
                  </Link>
                  <ExternalLink href={avtoNetUrl} className="btn btn-secondary w-full sm:w-auto">
                    Preveri aktualno ponudbo na Avto.net
                  </ExternalLink>
                </div>
              </div>
            )}
            {result.pages > 1 ? (
              <nav className="mt-6 flex flex-wrap gap-2" aria-label="Strani">
                {Array.from({ length: result.pages }, (_, index) => index + 1).map((page) => (
                  <Link
                    key={page}
                    href={pageHref(params, page)}
                    aria-current={page === result.page ? "page" : undefined}
                    className={`inline-flex h-12 min-w-12 items-center justify-center border px-3 ${page === result.page ? "border-ink bg-ink text-white" : "border-black/15 bg-white"}`}
                  >
                    {page}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
      <link rel="canonical" href={canonical.toString()} />
    </section>
  );
}

function conditionHref(params: Record<string, string | string[] | undefined>, condition: string) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || key === "condition" || value == null || value === "") continue;
    const one = Array.isArray(value) ? value[0] : value;
    if (one) search.set(key, one);
  }
  if (condition) search.set("condition", condition);
  const query = search.toString();
  return query ? `/motorji?${query}` : "/motorji";
}

function pageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value == null) continue;
    search.set(key, Array.isArray(value) ? value[0] : value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/motorji?${query}` : "/motorji";
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue?: string | number; type?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} min={type === "number" ? 0 : undefined} />
    </label>
  );
}

function Select({ name, label, value, options }: { name: string; label: string; value: string; options: string[] }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={value}>
        <option value="">Vse</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
