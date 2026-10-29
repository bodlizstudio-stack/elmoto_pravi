"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COMPARE_LIMIT,
  compareKey,
  readCompare,
  readCompareItems,
  saveCompareItem,
  writeCompare,
  type CompareBikeItem,
} from "@/components/compare-button";
import { conditionLabel, formatCc, formatKm, formatPower, formatPrice, statusLabel } from "@/lib/utils";

export type AvailableBikeOption = {
  id: string;
  name: string;
  image?: string | null;
  priceCents?: number | null;
  priceConfirmed?: boolean;
  year?: number | null;
  mileageKm?: number | null;
  engineCc?: number | null;
};

export function SavedBikes({
  title,
  empty,
  availableBikes = [],
}: {
  title: string;
  empty: string;
  availableBikes?: AvailableBikeOption[];
}) {
  const key = compareKey();
  const [bikes, setBikes] = useState<CompareBikeItem[] | null>(null);

  useEffect(() => {
    let controller = new AbortController();
    const load = () => {
      controller.abort();
      controller = new AbortController();
      const ids = readCompare().slice(0, COMPARE_LIMIT);
      if (!ids.length) {
        setBikes([]);
        return;
      }

      const cachedMap = readCompareItems();
      const initialCached = ids
        .map((id) => cachedMap[id])
        .filter((item): item is CompareBikeItem => Boolean(item));
      if (initialCached.length > 0) {
        setBikes(initialCached);
      }

      fetch(`/api/motorji?ids=${ids.join(",")}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data: CompareBikeItem[]) => {
          const byId = new Map<string, CompareBikeItem>();
          for (const id of ids) {
            if (cachedMap[id]) byId.set(id, cachedMap[id]);
          }
          if (Array.isArray(data)) {
            for (const item of data) {
              byId.set(item.id, item);
              saveCompareItem(item);
            }
          }
          const merged = ids
            .map((id) => byId.get(id))
            .filter((item): item is CompareBikeItem => Boolean(item))
            .slice(0, COMPARE_LIMIT);
          setBikes(merged);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setBikes((current) => current ?? initialCached);
        });
    };
    load();
    window.addEventListener("elmoto-compare", load);
    return () => {
      controller.abort();
      window.removeEventListener("elmoto-compare", load);
    };
  }, [key]);

  const selectedIds = new Set(bikes?.map((b) => b.id) ?? []);
  const remainingOptions = availableBikes.filter((b) => !selectedIds.has(b.id));

  const addBike = (id: string) => {
    const current = readCompare();
    if (current.includes(id) || current.length >= COMPARE_LIMIT) return;
    writeCompare([...current, id]);
  };

  const clearAll = () => {
    writeCompare([]);
  };

  return (
    <section className="bg-paper py-8 text-ink sm:py-12">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-5xl sm:text-7xl">{title}</h1>
            <p className="mt-2 text-sm text-[#B9BDC5]">
              Neposredna primerjava do {COMPARE_LIMIT} motorjev iz naše ponudbe.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {bikes && bikes.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="btn btn-secondary text-xs uppercase tracking-wider"
              >
                Počisti primerjavo
              </button>
            ) : null}
            <Link href="/motorji" className="btn btn-secondary">
              ← Nazaj na motorje
            </Link>
          </div>
        </div>

        {/* Quick add dropdown if fewer than limit */}
        {bikes && bikes.length < COMPARE_LIMIT && remainingOptions.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[12px] border border-white/10 bg-[#1E2025] p-4 text-sm text-white">
            <span className="font-semibold text-white">
              {bikes.length === 0
                ? "Izberi prvi motor za primerjavo:"
                : `Dodaj še en motor v primerjavo (${bikes.length}/${COMPARE_LIMIT}):`}
            </span>
            <select
              defaultValue=""
              aria-label="Izberi motor za primerjavo"
              onChange={(e) => {
                if (e.target.value) {
                  addBike(e.target.value);
                  e.target.value = "";
                }
              }}
              className="min-h-10 rounded-lg border border-white/15 bg-[#141518] px-3.5 py-1.5 text-sm text-white outline-none focus:border-accent"
            >
              <option value="" disabled>
                + Izberi motor s seznama...
              </option>
              {remainingOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} {opt.priceCents ? `· ${formatPrice(opt.priceCents, true)}` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {bikes == null ? <div className="mt-8 h-40 animate-pulse rounded-[14px] bg-[#25272D]" /> : null}

        {bikes && bikes.length ? (
          <p className="mt-4 text-sm text-[#B9BDC5]">
            V primerjavi: <strong className="text-white">{Math.min(bikes.length, COMPARE_LIMIT)}</strong> od{" "}
            {COMPARE_LIMIT} motorjev.
          </p>
        ) : null}

        {bikes?.length === 0 ? (
          <div className="mt-8 rounded-[14px] border border-white/10 bg-[#25272D] p-6 text-center sm:p-10">
            <p className="max-w-xl mx-auto leading-7 text-[#B9BDC5]">{empty}</p>
            {remainingOptions.length > 0 ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-white mb-4">Ali izberite enega od motorjev spodaj:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto text-left">
                  {remainingOptions.slice(0, 6).map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#1B1D22] p-3 text-sm"
                    >
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{opt.name}</p>
                        <p className="text-xs text-[#B9BDC5]">
                          {formatPrice(opt.priceCents, Boolean(opt.priceConfirmed))}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addBike(opt.id)}
                        className="btn btn-primary min-h-8 px-2.5 text-xs shrink-0"
                      >
                        + Primerjaj
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {bikes && bikes.length ? <CompareTable bikes={bikes} /> : null}
      </div>
    </section>
  );
}

function CompareTable({ bikes }: { bikes: CompareBikeItem[] }) {
  const rows: [string, (bike: CompareBikeItem) => string][] = [
    ["Cena", (bike) => formatPrice(bike.priceCents, bike.priceConfirmed)],
    ["Letnik", (bike) => (bike.year ? String(bike.year) : "ni navedeno")],
    ["Stanje", (bike) => conditionLabel(bike.condition) || "ni navedeno"],
    ["Razpoložljivost", (bike) => statusLabel(bike.status) || "Na voljo"],
    ["Kilometri", (bike) => formatKm(bike.mileageKm) || "ni navedeno"],
    ["Prostornina", (bike) => formatCc(bike.engineCc) || "ni navedeno"],
    ["Moč", (bike) => formatPower(bike.powerKw, bike.powerHp) || "ni navedeno"],
    ["Menjalnik", (bike) => bike.transmission || "ni navedeno"],
    ["Pogon", (bike) => bike.driveType || "ni navedeno"],
    ["Barva", (bike) => bike.color || "ni navedeno"],
    ["Kategorija", (bike) => bike.category || "ni navedeno"],
  ];
  return (
    <div className="mt-8 overflow-x-auto rounded-[14px] border border-white/10 bg-[#25272D]">
      <table className="w-full min-w-[40rem] border-collapse text-sm text-[#F5F5F5]">
        <thead>
          <tr className="bg-[#1B1D22]">
            <th className="p-4 text-left font-semibold text-white">Podatek</th>
            {bikes.map((bike) => (
              <th key={bike.id} className="p-4 text-left align-top">
                {bike.image ? (
                  <Link href={`/motorji/${bike.slug}`} className="mb-3 block overflow-hidden rounded-[8px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bike.image} alt={`${bike.brand} ${bike.model}`} className="h-32 w-48 object-cover" />
                  </Link>
                ) : null}
                <Link className="text-base font-bold text-white underline hover:text-accent" href={`/motorji/${bike.slug}`}>
                  {bike.brand} {bike.model} {bike.variant}
                </Link>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link href={`/motorji/${bike.slug}`} className="text-xs font-semibold text-accent underline">
                    Ogled motorja →
                  </Link>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.12em] text-[#B9BDC5] underline hover:text-accent"
                    onClick={() => writeCompare(readCompare().filter((item) => item !== bike.id))}
                  >
                    Odstrani
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-t border-white/10">
              <th className="p-3.5 text-left font-semibold text-[#B9BDC5]">{label}</th>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-3.5 font-medium text-white">
                  {value(bike)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
