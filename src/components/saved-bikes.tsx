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

export function SavedBikes({ title, empty }: { title: string; empty: string }) {
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

  return (
    <section className="bg-paper py-8 text-ink sm:py-12">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-5xl sm:text-7xl">{title}</h1>
          <Link href="/motorji" className="btn btn-secondary">
            ← Nazaj na motorje
          </Link>
        </div>
        {bikes == null ? <div className="mt-8 h-40 animate-pulse bg-white" /> : null}
        {bikes && bikes.length ? (
          <p className="mt-3 text-sm text-ink/60">
            V primerjavi: {Math.min(bikes.length, COMPARE_LIMIT)} od {COMPARE_LIMIT} motorjev.
          </p>
        ) : null}
        {bikes?.length === 0 ? <p className="mt-6 max-w-xl leading-7">{empty}</p> : null}
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
    <div className="mt-8 overflow-x-auto rounded-[12px] border border-black/10 bg-white">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="bg-[#f8f9fa]">
            <th className="p-4 text-left font-semibold">Podatek</th>
            {bikes.map((bike) => (
              <th key={bike.id} className="p-4 text-left align-top">
                {bike.image ? (
                  <Link href={`/motorji/${bike.slug}`} className="mb-3 block overflow-hidden rounded-[8px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bike.image} alt={`${bike.brand} ${bike.model}`} className="h-32 w-48 object-cover" />
                  </Link>
                ) : null}
                <Link className="text-base font-bold underline hover:text-accent" href={`/motorji/${bike.slug}`}>
                  {bike.brand} {bike.model} {bike.variant}
                </Link>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link href={`/motorji/${bike.slug}`} className="text-xs font-semibold text-accent underline">
                    Ogled motorja →
                  </Link>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.12em] text-ink/60 underline hover:text-accent"
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
            <tr key={label} className="border-t border-black/10">
              <th className="p-3.5 text-left font-semibold text-ink/70">{label}</th>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-3.5 font-medium">
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
