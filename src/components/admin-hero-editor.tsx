"use client";

import { useState } from "react";
import { saveHeroSettings } from "@/lib/actions/admin";
import type { HeroSettings } from "@/lib/settings";

export function AdminHeroEditor({ hero }: { hero: HeroSettings }) {
  const [image, setImage] = useState(hero.image);
  const [imageMobile, setImageMobile] = useState(hero.imageMobile);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [kicker, setKicker] = useState(hero.kicker);
  const [title, setTitle] = useState(hero.title);
  const [text, setText] = useState(hero.text);
  const [button, setButton] = useState(hero.button);
  const [focusX, setFocusX] = useState(hero.focusX);
  const [focusY, setFocusY] = useState(hero.focusY);
  const [overlay, setOverlay] = useState(hero.overlay);

  const previewUrl = desktopPreview || image || "/images/hero/hero-elmoto.webp";
  const overlayAlpha = Math.min(0.98, Math.max(0.25, overlay / 100));

  function handleDesktopFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setDesktopPreview(null);
      return;
    }
    setDesktopPreview(URL.createObjectURL(file));
  }

  function handleMobileFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setMobilePreview(null);
      return;
    }
    setMobilePreview(URL.createObjectURL(file));
  }

  return (
    <form action={saveHeroSettings} className="grid gap-6 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
        <div>
          <h2 className="display text-3xl text-[#16181c]">Urejanje naslovne strani → Hero sekcija</h2>
          <p className="mt-1 text-sm text-[#4e555d]">
            Zamenjaj glavno fotografijo, prilagodi izrez (fokus točko), temno prosojnico in besedilo na naslovnici.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setImage("/images/hero/hero-elmoto.webp");
            setImageMobile("/images/hero/hero-elmoto-mobile.webp");
            setDesktopPreview(null);
            setMobilePreview(null);
            setFocusX(68);
            setFocusY(28);
            setOverlay(72);
            setKicker("PREVERJENI MOTORJI. BREZSKRBNA VOŽNJA.");
            setTitle("TVOJA POT. TVOJ MOTOR.");
            setText(
              "Skrbno izbrana ponudba novih in rabljenih motornih koles z garancijo.\n\nNe glede na slog vožnje, pri EL-MOTO najdeš motor zase.",
            );
            setButton("Razišči motorje");
          }}
          className="btn btn-secondary text-sm"
        >
          Ponastavi na privzeto
        </button>
      </div>

      {/* Live Preview */}
      <div className="overflow-hidden rounded-[12px] border border-black/15 bg-[#111216] text-[#F5F5F5]">
        <div className="relative min-h-[340px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Predogled hero slike"
            style={{ objectPosition: `${focusX}% ${focusY}%` }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(92deg, rgba(17,18,22,0.97) 0%, rgba(17,18,22,0.92) 32%, rgba(17,18,22,0.62) 48%, rgba(17,18,22,0.14) 64%, rgba(17,18,22,0) 78%)",
              opacity: Math.min(1, overlayAlpha / 0.72),
            }}
          />
          <div className="relative z-10 flex min-h-[340px] max-w-xl flex-col justify-center p-6 sm:p-10">
            <p className="kicker text-xs">{kicker}</p>
            <h3 className="display mt-2 text-3xl text-white sm:text-4xl">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#F5F5F5]/90">{text}</p>
            <div className="mt-5">
              <span className="btn btn-primary pointer-events-none inline-flex">{button}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-[#1B1D22] px-4 py-2 text-xs text-[#B9BDC5]">
          Predogled v živo (namizni pogled) — Fokus: {focusX}% X / {focusY}% Y · Temna prosojnica: {overlay}%
        </div>
      </div>

      <input type="hidden" name="heroImage" value={image} />
      <input type="hidden" name="heroImageMobile" value={imageMobile} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span>Naloži novo Hero sliko (namizna)</span>
          <input
            type="file"
            name="heroImageFile"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleDesktopFile}
          />
          <small className="text-xs text-[#4e555d]">Trenutna pot: {image}</small>
        </label>

        <label className="field">
          <span>Naloži mobilno Hero sliko (neobvezno)</span>
          <input
            type="file"
            name="heroImageMobileFile"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleMobileFile}
          />
          <small className="text-xs text-[#4e555d]">
            {mobilePreview ? "Izbrana nova mobilna slika" : `Trenutna pot: ${imageMobile}`}
          </small>
        </label>
      </div>

      <div className="grid gap-4 rounded-[10px] border border-black/10 bg-[#f8f9fa] p-4 sm:grid-cols-3">
        <label className="field">
          <span>Vodoravni fokus slike X ({focusX}%)</span>
          <input
            type="range"
            name="heroFocusX"
            min={0}
            max={100}
            value={focusX}
            onChange={(e) => setFocusX(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span>Navpični fokus slike Y ({focusY}%)</span>
          <input
            type="range"
            name="heroFocusY"
            min={0}
            max={100}
            value={focusY}
            onChange={(e) => setFocusY(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span>Moč temne prosojnice ({overlay}%)</span>
          <input
            type="range"
            name="heroOverlay"
            min={25}
            max={98}
            value={overlay}
            onChange={(e) => setOverlay(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span>Kicker (nadnaslov)</span>
          <input name="heroKicker" value={kicker} onChange={(e) => setKicker(e.target.value)} />
        </label>
        <label className="field">
          <span>Glavni naslov (Hero Title)</span>
          <input name="heroTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field sm:col-span-2">
          <span>Podnaslov / opis v Hero sekciji</span>
          <textarea
            name="heroText"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-24"
          />
        </label>
        <label className="field">
          <span>Besedilo glavnega rdečega gumba</span>
          <input name="heroButton" value={button} onChange={(e) => setButton(e.target.value)} />
        </label>
      </div>

      <div>
        <button className="btn btn-primary w-full sm:w-auto" type="submit">
          Shrani Hero sekcijo
        </button>
      </div>
    </form>
  );
}
