"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "elmoto-compare";
export const COMPARE_LIMIT = 3;
const LIMIT_NOTE = "Primerjaš lahko največ tri motorje. Odpri Primerjaj in odstrani enega, nato dodaš novega.";

function readIds(key: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
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

export function CompareToggle({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const sync = () => setOn(readCompare().includes(id));
    sync();
    window.addEventListener("elmoto-compare", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("elmoto-compare", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  return (
    <div>
      <button
        type="button"
        aria-pressed={on}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-black/30 underline-offset-4"
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
          writeCompare([...ids, id]);
          setNote("");
        }}
      >
        {on ? "Odstrani iz primerjave" : "Dodaj v primerjavo"}
      </button>
      {note ? (
        <p className="mt-1 text-sm leading-5 text-accent" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function CompareActions({ id }: { id: string }) {
  return <CompareToggle id={id} />;
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
