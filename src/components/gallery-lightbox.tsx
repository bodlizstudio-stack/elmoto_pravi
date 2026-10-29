"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export type GalleryPhoto = {
  id: string;
  url: string;
  alt: string;
};

export function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showPrev = useCallback(() => {
    if (selectedIndex === null || photos.length === 0) return;
    setSelectedIndex((prev) => ((prev ?? 0) - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos.length]);

  const showNext = useCallback(() => {
    if (selectedIndex === null || photos.length === 0) return;
    setSelectedIndex((prev) => ((prev ?? 0) + 1) % photos.length);
  }, [selectedIndex, photos.length]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        showPrev();
      } else if (e.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedIndex, closeLightbox, showPrev, showNext]);

  return (
    <>
      {/* GRID FOTOGRAFIJ */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <figure
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="group relative cursor-pointer overflow-hidden rounded-[14px] border border-[#E2E5E9] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#E31B2B] hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F6F6F4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.alt || "Galerija EL-MOTO"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-bold text-[#16181C] shadow-md">
                  <ZoomIn className="h-4 w-4 text-[#E31B2B]" />
                  Povečaj
                </span>
              </div>
            </div>
            {photo.alt ? (
              <figcaption className="p-3.5 text-sm font-medium text-[#5B616B]">
                {photo.alt}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {selectedIndex !== null && photos[selectedIndex] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Povečana slika"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
          onClick={closeLightbox}
        >
          {/* ZGORNJA ORODNA VRSTICA */}
          <div className="absolute left-4 top-4 z-20 flex items-center gap-3 text-white/90">
            <span className="rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
              {selectedIndex + 1} / {photos.length}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Zapri prikaz"
            className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-105"
          >
            <X className="h-6 w-6" />
          </button>

          {/* PUŠČICA LEVO */}
          {photos.length > 1 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Prejšnja slika"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-[#E31B2B] hover:scale-110 sm:left-6 sm:h-14 sm:w-14"
            >
              <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
          ) : null}

          {/* PUŠČICA DESNO */}
          {photos.length > 1 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Naslednja slika"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-[#E31B2B] hover:scale-110 sm:right-6 sm:h-14 sm:w-14"
            >
              <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
          ) : null}

          {/* GLAVNA SLIKA */}
          <div
            className="relative flex max-h-[85vh] max-w-[92vw] flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].alt || "Povečana slika"}
              className="max-h-[80vh] max-w-[90vw] rounded-[10px] object-contain shadow-2xl transition duration-200 select-none"
            />
            {photos[selectedIndex].alt ? (
              <p className="mt-3 text-center text-sm font-medium text-white/90 sm:text-base">
                {photos[selectedIndex].alt}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
