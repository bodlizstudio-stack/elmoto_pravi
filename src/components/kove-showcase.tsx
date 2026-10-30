"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, X } from "lucide-react";
import type { KoveModel } from "@/lib/kove";

export function KoveShowcase({
  models,
  showFooterLinks = true,
}: {
  models: KoveModel[];
  showFooterLinks?: boolean;
}) {
  const [selectedModel, setSelectedModel] = useState<KoveModel | null>(null);

  const closeModal = useCallback(() => {
    setSelectedModel(null);
  }, []);

  useEffect(() => {
    if (!selectedModel) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedModel, closeModal]);

  return (
    <>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <article
            key={model.slug}
            className="group flex flex-col overflow-hidden rounded-[14px] border border-[#E2E5E9] bg-[#FDFDFD] shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#E31B2B] hover:shadow-[0_12px_28px_rgba(227,27,43,0.12)]"
          >
            <div
              className="relative aspect-[16/10] cursor-pointer overflow-hidden bg-[#F6F6F4]"
              onClick={() => setSelectedModel(model)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={model.image}
                alt={`${model.name} — pooblaščeni prodajalec KOVE`}
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute left-3 top-3 rounded-md bg-[#16181C] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                KOVE
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="display text-2xl text-[#16181C] transition-colors group-hover:text-[#E31B2B]">
                {model.name}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-6 text-[#5B616B]">
                {model.description}
              </p>

              {model.features && model.features.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {model.features.map((feat) => (
                    <span
                      key={feat}
                      className="rounded-full border border-[#E2E5E9] bg-white px-2.5 py-1 text-xs font-medium text-[#16181C]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 border-t border-[#E2E5E9] pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedModel(model)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E5E9] bg-white py-2.5 text-sm font-bold text-[#16181C] transition-colors hover:border-[#E31B2B] hover:bg-[#E31B2B] hover:text-white"
                >
                  <span>Več informacij</span>
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* DETAIL MODAL POPUP */}
      {selectedModel ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedModel.name}
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

            {/* Slika modela */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F6F6F4] p-4 sm:aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedModel.image}
                alt={selectedModel.name}
                className="h-full w-full object-contain"
              />
              <span className="absolute left-4 top-4 rounded-md bg-[#16181C] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                KOVE
              </span>
            </div>

            {/* Vsebina modala */}
            <div className="p-6 sm:p-8">
              <h2 className="display text-3xl text-[#16181C] sm:text-4xl">
                {selectedModel.name}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#5B616B]">
                {selectedModel.description}
              </p>

              {/* Tehnične specifikacije */}
              {selectedModel.features && selectedModel.features.length > 0 ? (
                <div className="mt-5 border-t border-[#E2E5E9] pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B616B]">
                    Tehnični poudarki &amp; oprema
                  </h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {selectedModel.features.map((feat) => (
                      <div
                        key={feat}
                        className="flex items-center gap-2 rounded-lg border border-[#E2E5E9] bg-[#F6F6F4] px-3 py-2 text-sm font-semibold text-[#16181C]"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#E31B2B]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Akcijski gumbi */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/kontakt?vrsta=PURCHASE&model=${encodeURIComponent(selectedModel.name)}#kontaktni-obrazec`}
                  className="btn btn-primary flex-1 justify-center py-3 text-sm font-bold"
                  onClick={closeModal}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Povprašaj za ta model
                </Link>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary justify-center py-3 text-sm font-bold sm:w-auto"
                >
                  Zapri
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
