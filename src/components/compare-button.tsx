"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "elmoto-compare";
const ITEMS_KEY = "elmoto-compare-items";
export const COMPARE_LIMIT = 3;
const LIMIT_NOTE = "Primerjaš lahko največ tri motorje. Odpri Primerjaj in odstrani enega, nato dodaš novega.";

export type CompareBikeItem = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number | null;
  mileageKm: number | null;
  engineCc: number | null;
  powerKw: number | null;
  powerHp: number | null;
  transmission: string;
  driveType: string;
  color: string;
  licenseCategory: string;
  category: string;
  condition: string;
  status: string;
  priceCents: number | null;
  priceConfirmed: boolean;
  image: string | null;
  sourceUrl?: string;
};

function readIds(key: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function readCompareItems(): Record<string, CompareBikeItem> {
  try {
    const parsed = JSON.parse(localStorage.getItem(ITEMS_KEY) || "{}") as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, CompareBikeItem>;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveCompareItem(item: CompareBikeItem) {
  try {
    const current = readCompareItems();
    current[item.id] = item;
    localStorage.setItem(ITEMS_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage errors
  }
}

export function compareKey() {
  return KEY;
}

export function readCompare() {
  return readIds(KEY).slice(0, COMPARE_LIMIT);
}

export function writeCompare(ids: string[]) {
  const next = ids.filter((id, index) => ids.indexOf(id) === index).slice(0, COMPARE_LIMIT);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("elmoto-compare"));
  return next;
}

export function CompareToggle({ id, bike }: { id: string; bike?: CompareBikeItem }) {
  const [on, setOn] = useState(false);
  const [count, setCount] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    const sync = () => {
      const ids = readCompare();
      setOn(ids.includes(id));
      setCount(ids.length);
    };
    sync();
    window.addEventListener("elmoto-compare", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("elmoto-compare", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          aria-pressed={on}
          className="inline-flex min-h-10 items-center text-sm font-semibold text-ink underline decoration-black/30 underline-offset-4 hover:text-accent"
          onClick={() => {
            const ids = readCompare();
            if (ids.includes(id)) {
              writeCompare(ids.filter((item) => item !== id));
              setNote("");
              return;
            }
            if (ids.length >= COMPARE_LIMIT) {
              setNote(LIMIT_NOTE);
              return;
            }
            if (bike) {
              saveCompareItem(bike);
            }
            writeCompare([...ids, id]);
            setNote("");
          }}
        >
          {on ? "✓ V primerjavi (odstrani)" : "+ Dodaj v primerjavo"}
        </button>
        {on ? (
          <Link
            href="/primerjava"
            className="inline-flex min-h-9 items-center rounded-lg bg-[#171a1f] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-accent"
          >
            Primerjaj ({count}/3) →
          </Link>
        ) : null}
      </div>
      {note ? (
        <p className="mt-1 text-sm leading-5 text-accent" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function CompareActions({ id, bike }: { id: string; bike?: CompareBikeItem }) {
  return <CompareToggle id={id} bike={bike} />;
}

export function CompareLink({ className, always = false }: { className?: string; always?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readCompare().length);
    sync();
    window.addEventListener("elmoto-compare", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("elmoto-compare", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!always && count === 0) return null;
  return (
    <Link href="/primerjava" className={className}>
      Primerjaj{count ? ` (${count}/3)` : ""}
    </Link>
  );
}
