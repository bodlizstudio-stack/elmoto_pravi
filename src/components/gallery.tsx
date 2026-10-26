"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "@/components/photo";

export function Gallery({ images, title }: { images: { url: string; alt: string }[]; title: string }) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const safeIndex = images.length ? index % images.length : 0;
  const current = images[safeIndex];

  const move = (direction: number) => {
    if (images.length < 2) return;
    setIndex((value) => (value + direction + images.length) % images.length);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (images.length < 2) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      const dialogOpen = Boolean(dialogRef.current?.open);
      const inside = rootRef.current?.contains(document.activeElement) || dialogOpen;
      if (!inside && event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (!dialogOpen && !inside) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "Escape") dialogRef.current?.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length]);

  if (!current) {
    return <div className="grid aspect-[4/3] place-items-center rounded-[12px] bg-[#f5f6f7] text-[#5b616b]">Fotografija še ni naložena.</div>;
  }

  return (
    <div ref={rootRef}>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[#f5f6f7]"
        onTouchStart={(event) => {
          startX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (startX.current == null) return;
          const delta = (event.changedTouches[0]?.clientX ?? startX.current) - startX.current;
          if (delta > 40) move(-1);
          if (delta < -40) move(1);
          startX.current = null;
        }}
      >
        <Photo key={current.url} src={current.url} alt={current.alt || title} sizes="(min-width: 1024px) 60vw, 100vw" priority={safeIndex === 0} fit="contain" />
        {images.length > 1 ? (
          <>
            <button type="button" className="gallery-nav left-3" onClick={() => move(-1)} aria-label="Prejšnja fotografija">
              <ChevronLeft aria-hidden className="h-6 w-6" />
            </button>
            <button type="button" className="gallery-nav right-3" onClick={() => move(1)} aria-label="Naslednja fotografija">
              <ChevronRight aria-hidden className="h-6 w-6" />
            </button>
            <p className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-[#171a1f]" aria-live="polite">
              {safeIndex + 1} / {images.length}
            </p>
          </>
        ) : null}
        <button type="button" className="absolute bottom-3 right-3 min-h-11 rounded-full bg-white/95 px-3 text-sm font-semibold text-[#171a1f]" onClick={() => dialogRef.current?.showModal()}>
          Povečaj
        </button>
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, imageIndex) => (
            <button
              key={image.url + imageIndex}
              type="button"
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-[8px] border-2 bg-[#f5f6f7] ${imageIndex === safeIndex ? "border-[#ec2336]" : "border-transparent"}`}
              onClick={() => setIndex(imageIndex)}
              aria-label={`Fotografija ${imageIndex + 1}`}
              aria-current={imageIndex === safeIndex ? "true" : undefined}
            >
              <Photo src={image.url} alt="" sizes="80px" fit="cover" />
            </button>
          ))}
        </div>
      ) : null}
      <dialog
        ref={dialogRef}
        className="h-[100dvh] max-h-none w-screen max-w-none bg-[#111318] p-0 text-white backdrop:bg-black/80"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 p-3">
            <p className="text-sm">
              {title}
              {images.length > 1 ? ` · ${safeIndex + 1} / ${images.length}` : ""}
            </p>
            <button type="button" className="h-12 min-w-12 border border-white/30 px-3" onClick={() => dialogRef.current?.close()} autoFocus>
              Zapri
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Photo key={`full-${current.url}`} src={current.url} alt={current.alt || title} sizes="100vw" fit="contain" />
            {images.length > 1 ? (
              <>
                <button type="button" className="gallery-nav left-3" onClick={() => move(-1)} aria-label="Prejšnja fotografija">
                  <ChevronLeft aria-hidden className="h-6 w-6" />
                </button>
                <button type="button" className="gallery-nav right-3" onClick={() => move(1)} aria-label="Naslednja fotografija">
                  <ChevronRight aria-hidden className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </dialog>
    </div>
  );
}
