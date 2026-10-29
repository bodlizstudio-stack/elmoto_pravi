"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, ShoppingBag, X } from "lucide-react";

export type EquipmentItemData = {
  id: string;
  title: string;
  priceCents: number | null;
  formattedPrice: string;
  description: string;
  category: string;
  imageUrl: string;
  avtonetUrl: string;
};

export function EquipmentView({ items }: { items: EquipmentItemData[] }) {
  const [selectedItem, setSelectedItem] = useState<EquipmentItemData | null>(null);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Keyboard navigation (Escape to close)
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedItem, closeModal]);

  return (
    <>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-[#E2E5E9] bg-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#E31B2B] hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F6F6F4]">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[#888]">
                  Slika artikla
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-md bg-[#16181c]/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                {item.category}
              </span>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                <span className="rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-bold text-[#16181C] shadow-md">
                  Poglej podrobnosti
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <div>
                <h3 className="text-lg font-bold text-[#16181C] transition-colors group-hover:text-[#E31B2B]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xl font-extrabold text-[#E31B2B]">
                  {item.formattedPrice}
                </p>
                {item.description ? (
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#5B616B]">
                    {item.description}
                  </p>
                ) : null}
              </div>

              <div
                className="mt-5 flex flex-col gap-2 border-t border-[#F0F2F5] pt-4"
                onClick={(e) => e.stopPropagation()}
              >
                {item.avtonetUrl ? (
                  <a
                    href={item.avtonetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary w-full text-center text-xs"
                  >
                    Poglej na Avto.net ↗
                  </a>
                ) : null}
                <Link
                  href={`/kontakt?vrsta=GENERAL&model=${encodeURIComponent(item.title)}#kontaktni-obrazec`}
                  className="btn btn-primary w-full text-center text-xs"
                >
                  Povprašaj za artikel
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* DETAIL MODAL / POPUP OB KLIKU NA ARTIKEL */}
      {selectedItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={closeModal}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-[16px] border border-[#E2E5E9] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gumb za zapiranje */}
            <button
              onClick={closeModal}
              aria-label="Zapri okno"
              className="absolute right-3.5 top-3.5 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Velika slika artikla */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F6F6F4] sm:aspect-[16/9]">
              {selectedItem.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-[#888]">
                  Slika ni na voljo
                </div>
              )}
              <span className="absolute left-4 top-4 rounded-md bg-[#16181C]/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                {selectedItem.category}
              </span>
            </div>

            {/* Vsebina in podatki */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="display text-2xl text-[#16181C] sm:text-3xl">
                  {selectedItem.title}
                </h2>
                <span className="text-2xl font-black text-[#E31B2B] sm:text-3xl">
                  {selectedItem.formattedPrice}
                </span>
              </div>

              {selectedItem.description ? (
                <div className="mt-4 border-t border-[#E2E5E9] pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B616B]">
                    Opis in specifikacije
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#16181C] whitespace-pre-line">
                    {selectedItem.description}
                  </p>
                </div>
              ) : null}

              {/* Akcijski gumbi */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/kontakt?vrsta=GENERAL&model=${encodeURIComponent(selectedItem.title)}#kontaktni-obrazec`}
                  className="btn btn-primary flex-1 justify-center py-3 text-sm font-bold"
                  onClick={closeModal}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Pošlji povpraševanje za ta artikel
                </Link>
                {selectedItem.avtonetUrl ? (
                  <a
                    href={selectedItem.avtonetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary flex-1 justify-center py-3 text-sm font-bold"
                  >
                    Ogled na Avto.net
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
