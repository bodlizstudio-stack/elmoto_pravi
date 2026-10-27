"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { MotoCard } from "@/components/moto-card";
import type { PublicBike } from "@/lib/motorcycles";
import { avtoNetUrl } from "@/lib/site";

type InitialFilters = {
  condition?: string;
  brand?: string;
  model?: string;
  category?: string;
  sort?: string;
};

export function CatalogLiveFilter({
  bikes,
  initial,
}: {
  bikes: PublicBike[];
  initial: InitialFilters;
}) {
  const [condition, setCondition] = useState<string>(initial.condition || "");
  const [brand, setBrand] = useState<string>(initial.brand || "");
  const [query, setQuery] = useState<string>(initial.model || "");
  const [category, setCategory] = useState<string>(initial.category || "");
  const [priceMax, setPriceMax] = useState<string>("");
  const [yearMin, setYearMin] = useState<string>("");
  const [mileageMax, setMileageMax] = useState<string>("");
  const [includeSold, setIncludeSold] = useState<boolean>(false);
  const [sort, setSort] = useState<string>(initial.sort || "newest");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (
    prevInitial.condition !== initial.condition ||
    prevInitial.brand !== initial.brand ||
    prevInitial.model !== initial.model ||
    prevInitial.category !== initial.category
  ) {
    setPrevInitial(initial);
    setCondition(initial.condition || "");
    setBrand(initial.brand || "");
    setQuery(initial.model || "");
    setCategory(initial.category || "");
  }

  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const bike of bikes) {
      if (bike.brand) set.add(bike.brand);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "sl"));
  }, [bikes]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const bike of bikes) {
      if (bike.category) set.add(bike.category);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "sl"));
  }, [bikes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const maxPriceCents = priceMax ? Number(priceMax) * 100 : null;
    const minYear = yearMin ? Number(yearMin) : null;
    const maxKm = mileageMax ? Number(mileageMax) : null;

    return bikes
      .filter((bike) => {
        if (!includeSold && bike.status === "SOLD") return false;
        if (condition && bike.condition !== condition) return false;
        if (brand && bike.brand.toLowerCase() !== brand.toLowerCase()) return false;
        if (category && bike.category.toLowerCase() !== category.toLowerCase()) return false;
        if (q) {
          const haystack = `${bike.brand} ${bike.model} ${bike.variant} ${bike.category} ${bike.year ?? ""} ${bike.description}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (maxPriceCents != null && Number.isFinite(maxPriceCents) && maxPriceCents > 0) {
          if (!bike.priceConfirmed || !bike.priceCents || bike.priceCents > maxPriceCents) return false;
        }
        if (minYear != null && Number.isFinite(minYear) && minYear > 0) {
          if (!bike.year || bike.year < minYear) return false;
        }
        if (maxKm != null && Number.isFinite(maxKm) && maxKm >= 0) {
          if (bike.mileageKm == null || bike.mileageKm > maxKm) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "price_asc" || sort === "price_desc") {
          const av = a.priceConfirmed && a.priceCents && a.priceCents > 0 ? a.priceCents : null;
          const bv = b.priceConfirmed && b.priceCents && b.priceCents > 0 ? b.priceCents : null;
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          return sort === "price_asc" ? av - bv : bv - av;
        }
        if (sort === "year_desc") return (b.year ?? 0) - (a.year ?? 0);
        if (sort === "year_asc") return (a.year ?? 9999) - (b.year ?? 9999);
        if (sort === "mileage_asc") {
          return (a.mileageKm ?? Number.POSITIVE_INFINITY) - (b.mileageKm ?? Number.POSITIVE_INFINITY);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [bikes, condition, brand, category, query, priceMax, yearMin, mileageMax, includeSold, sort]);

  const hasActiveFilters = Boolean(
    condition || brand || category || query || priceMax || yearMin || mileageMax || includeSold,
  );

  function resetAll() {
    setCondition("");
    setBrand("");
    setQuery("");
    setCategory("");
    setPriceMax("");
    setYearMin("");
    setMileageMax("");
    setIncludeSold(false);
    setSort("newest");
  }

  return (
    <div className="mt-8">
      {/* Top Quick Bar: Novi / Rabljeni + Live Search + Quick Brand Pills */}
      <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          {/* Condition Tabs: Vsi / Rabljeni / Novi */}
          <div role="group" aria-label="Stanje motorja" className="flex flex-wrap gap-2">
            {[
              { id: "", label: "Vsi motorji" },
              { id: "USED", label: "Rabljeni motorji" },
              { id: "NEW", label: "Novi motorji" },
            ].map((tab) => {
              const selected = condition === tab.id;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setCondition(tab.id)}
                  className={`inline-flex min-h-11 items-center rounded-[10px] border px-4 text-sm font-bold uppercase tracking-wider transition ${
                    selected
                      ? "border-[#E31B2B] bg-[#E31B2B] text-white"
                      : "border-white/15 bg-[#1B1D22] text-[#F5F5F5] hover:border-white/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Instant Live Search Box */}
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B9BDC5]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sproti išči po znamki, modelu ali opisu ..."
              aria-label="Išči motor"
              className="pl-10 pr-9"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Počisti iskanje"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#B9BDC5] hover:text-white"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Razvrsti motorje"
              className="min-w-44"
            >
              <option value="newest">Najnovejši najprej</option>
              <option value="price_asc">Cena: od najnižje</option>
              <option value="price_desc">Cena: od najvišje</option>
              <option value="year_desc">Letnik: novejši</option>
              <option value="mileage_asc">Najmanj kilometrov</option>
            </select>
            <button
              type="button"
              onClick={() => setShowMobileFilters((v) => !v)}
              className="btn btn-secondary min-h-12 px-3 lg:hidden"
            >
              <SlidersHorizontal aria-hidden className="h-4 w-4" />
              Filtri
            </button>
          </div>
        </div>

        {/* Quick Clickable Brand Pills */}
        {brands.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B9BDC5]">Znamka:</span>
            <button
              type="button"
              onClick={() => setBrand("")}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                brand === ""
                  ? "border-[#E31B2B] bg-[#E31B2B] text-white"
                  : "border-white/15 bg-[#1B1D22] text-[#F5F5F5] hover:border-white/40"
              }`}
            >
              Vse znamke
            </button>
            {brands.map((b) => {
              const active = brand.toLowerCase() === b.toLowerCase();
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(active ? "" : b)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                    active
                      ? "border-[#E31B2B] bg-[#E31B2B] text-white"
                      : "border-white/15 bg-[#1B1D22] text-[#F5F5F5] hover:border-white/40"
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Results counter + Reset */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#B9BDC5]" aria-live="polite">
          Prikazanih motorjev: <strong className="text-white">{filtered.length}</strong>{" "}
          {bikes.length !== filtered.length ? `od ${bikes.length}` : ""}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#E31B2B] underline"
          >
            <X aria-hidden className="h-4 w-4" />
            Ponastavi vse filtre
          </button>
        ) : null}
      </div>

      {/* Sidebar + Grid */}
      <div className="mt-4 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className={`${showMobileFilters ? "block" : "hidden"} lg:block`}>
          <div className="grid gap-3.5 rounded-[14px] border border-white/10 bg-[#25272D] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="display text-xl text-white">Podrobni filtri</h2>
              {hasActiveFilters ? (
                <button type="button" onClick={resetAll} className="text-xs font-semibold text-[#E31B2B] underline">
                  Počisti
                </button>
              ) : null}
            </div>

            <label className="field">
              <span>Stanje</span>
              <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="">Vsi (novi in rabljeni)</option>
                <option value="NEW">Novi motorji</option>
                <option value="USED">Rabljeni motorji</option>
              </select>
            </label>

            <label className="field">
              <span>Znamka</span>
              <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">Vse znamke</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Model ali ključna beseda</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="npr. Tracer, Hornet, 800..."
              />
            </label>

            {categories.length > 0 ? (
              <label className="field">
                <span>Kategorija</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Vse kategorije</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="field">
              <span>Cena do (EUR)</span>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="npr. 10000"
              />
            </label>

            <label className="field">
              <span>Letnik od</span>
              <input
                type="number"
                min={1970}
                max={2035}
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
                placeholder="npr. 2020"
              />
            </label>

            <label className="field">
              <span>Kilometri do</span>
              <input
                type="number"
                min={0}
                value={mileageMax}
                onChange={(e) => setMileageMax(e.target.value)}
                placeholder="npr. 25000"
              />
            </label>

            <label className="flex min-h-10 items-center gap-2.5 text-sm text-[#B9BDC5]">
              <input
                type="checkbox"
                checked={includeSold}
                onChange={(e) => setIncludeSold(e.target.checked)}
              />
              <span>Pokaži tudi prodane motorje</span>
            </label>
          </div>
        </aside>

        <div>
          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((bike) => (
                <MotoCard key={bike.id} bike={bike} />
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
              <h2 className="display text-3xl text-white">Ni zadetkov za izbrane filtre</h2>
              <p className="mt-3 leading-7 text-[#B9BDC5]">
                Za izbrano kombinacijo filtrov trenutno ni motorjev. Ponastavi filtre ali preveri celotno ponudbo na Avto.net.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={resetAll} className="btn btn-primary w-full sm:w-auto">
                  Pokaži vse motorje
                </button>
                <ExternalLink href={avtoNetUrl} className="btn btn-secondary w-full sm:w-auto">
                  Preveri aktualno ponudbo na Avto.net
                </ExternalLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
