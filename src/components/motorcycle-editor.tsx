"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { PhotoManager } from "@/components/photo-manager";
import { saveMotorcycle, type ActionState } from "@/lib/actions/admin";
import { publicationLabel } from "@/lib/offer";
import { parseSpecs } from "@/lib/utils";

type Photo = {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
  sortOrder: number;
};

export type EditableBike = {
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
  engineType: string;
  transmission: string;
  driveType: string;
  color: string;
  licenseCategory: string;
  category: string;
  condition: string;
  status: string;
  publication: string;
  forSale: boolean;
  forRent: boolean;
  priceCents: number | null;
  priceConfirmed: boolean;
  priceOnRequest: boolean;
  cardSummary: string;
  description: string;
  equipment: string;
  serviceHistory: string;
  featured: boolean;
  featuredOrder: number;
  seoTitle: string;
  seoDescription: string;
  source: string;
  sourceCheckedAt: string;
  specs: string;
  images: Photo[];
};

const EXAMPLE_SPECS = `Starost:\tnovo
Prevoženi km:\t
Motor:\t498 ccm, 2 valjni, 4 taktni
Moč motorja:\t35 kW (48 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tEnduro
Barva:\tčrna
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`;

export function MotorcycleEditor({ bike }: { bike?: EditableBike }) {
  const [state, action, pending] = useActionState(saveMotorcycle, null as ActionState);
  const [dirty, setDirty] = useState(false);

  const [brand, setBrand] = useState(bike?.brand ?? "");
  const [model, setModel] = useState(bike?.model ?? "");
  const [year, setYear] = useState(bike?.year != null ? String(bike.year) : "");
  const [mileageKm, setMileageKm] = useState(bike?.mileageKm != null ? String(bike.mileageKm) : "");
  const [engineCc, setEngineCc] = useState(bike?.engineCc != null ? String(bike.engineCc) : "");
  const [powerKw, setPowerKw] = useState(bike?.powerKw != null ? String(bike.powerKw) : "");
  const [powerHp, setPowerHp] = useState(bike?.powerHp != null ? String(bike.powerHp) : "");
  const [priceEur, setPriceEur] = useState(
    bike?.priceCents && bike.priceCents > 0 ? String(bike.priceCents / 100) : "",
  );
  const [condition, setCondition] = useState(bike?.condition || "");
  const [category, setCategory] = useState(bike?.category ?? "");
  const [color, setColor] = useState(bike?.color ?? "");
  const [transmission, setTransmission] = useState(bike?.transmission ?? "");
  const [driveType, setDriveType] = useState(bike?.driveType ?? "");
  const [engineType, setEngineType] = useState(bike?.engineType ?? "");
  const [specsText, setSpecsText] = useState(bike?.specs ?? "");
  const [description, setDescription] = useState(bike?.description || bike?.cardSummary || "");

  const unsaved = dirty || Boolean(state?.error);
  const published = bike?.publication === "PUBLISHED";
  const parsedTable = parseSpecs(specsText);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!unsaved) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [unsaved]);

  function handleSpecsChange(raw: string) {
    setDirty(true);
    setSpecsText(raw);
    const items = parseSpecs(raw);
    for (const item of items) {
      const key = item.label.toLowerCase();
      const val = item.value;
      if (key.includes("starost") || key.includes("stanje")) {
        if (val.toLowerCase().includes("novo")) setCondition("NEW");
        else if (val.toLowerCase().includes("rabljeno") || val.toLowerCase().includes("testno")) setCondition("USED");
      } else if (key.includes("letnik") || key.includes("registracija")) {
        const y = val.match(/\b(19[7-9]\d|20[0-3]\d)\b/);
        if (y && !year) setYear(y[1]);
      } else if (key.includes("prevoženi") || key.includes("kilometri")) {
        const km = val.replace(/\./g, "").match(/\b(\d{1,6})\b/);
        if (km) setMileageKm(km[1]);
      } else if (key === "motor" || key.includes("prostornina")) {
        const cc = val.match(/(\d{2,4})\s*ccm/i);
        if (cc) setEngineCc(cc[1]);
        setEngineType(val);
      } else if (key.includes("moč")) {
        const kw = val.match(/(\d+(?:[.,]\d+)?)\s*kW/i);
        const hp = val.match(/(\d+(?:[.,]\d+)?)\s*(?:KM|HP|KS)/i);
        if (kw) setPowerKw(kw[1].replace(",", "."));
        if (hp) setPowerHp(hp[1].replace(",", "."));
      } else if (key.includes("menjalnik")) {
        setTransmission(val);
      } else if (key.includes("prenos")) {
        setDriveType(val);
      } else if (key.includes("kategorija")) {
        setCategory(val);
      } else if (key.includes("barva")) {
        setColor(val);
      }
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{bike ? "Uredi motor" : "Nov motor"}</h1>
          {bike ? <p className="mt-2 text-sm text-ink/70">Stanje objave: {publicationLabel(bike.publication)}</p> : null}
        </div>
        <Link
          href="/admin"
          className="btn btn-secondary"
          onClick={(event) => {
            if (unsaved && !window.confirm("Imaš neshranjene spremembe. Želiš vseeno zapustiti stran?")) event.preventDefault();
          }}
        >
          Nazaj na ponudbo
        </Link>
      </div>
      {state?.error ? (
        <p className="border border-accent/40 bg-white p-3 text-sm text-accent" role="alert">
          {state.error}
        </p>
      ) : null}
      <form
        action={action}
        className="grid gap-6"
        onChange={() => setDirty(true)}
        onSubmit={() => setDirty(false)}
      >
        {bike ? <input type="hidden" name="id" value={bike.id} /> : null}
        <input type="hidden" name="engineCc" value={engineCc} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="color" value={color} />
        <input type="hidden" name="transmission" value={transmission} />
        <input type="hidden" name="driveType" value={driveType} />
        <input type="hidden" name="engineType" value={engineType} />

        <section className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Motor</h2>
          <p className="text-sm leading-6 text-ink/70">
            Vnesi znamko, model in ceno, spodaj pa preprosto prilepi specifikacije z Avto.net — tabela in tehnična polja se ustvarijo samodejno.
          </p>
          {bike?.publication === "ARCHIVED" ? (
            <p className="text-sm leading-6">Ta motor je zdaj skrit. Shranjevanje ga spet pokaže na strani.</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="field">
              <span>Znamka *</span>
              <input name="brand" required value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="npr. KOVE, Yamaha, Honda" />
            </label>
            <label className="field">
              <span>Model *</span>
              <input name="model" required value={model} onChange={(e) => setModel(e.target.value)} placeholder="npr. 510X, Tracer 9 GT" />
            </label>
            <label className="field">
              <span>Cena (EUR)</span>
              <input name="priceEur" value={priceEur} onChange={(e) => setPriceEur(e.target.value)} placeholder="npr. 6590" />
              <small className="text-sm text-ink/60">Prazno pomeni ceno na povpraševanje.</small>
            </label>
            <label className="field">
              <span>Letnik</span>
              <input name="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="npr. 2026" />
            </label>
            <label className="field">
              <span>Kilometri</span>
              <input name="mileageKm" type="number" value={mileageKm} onChange={(e) => setMileageKm(e.target.value)} />
            </label>
            <label className="field">
              <span>Novo ali rabljeno</span>
              <select name="condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="">Ni izbrano</option>
                <option value="USED">Rabljeno</option>
                <option value="NEW">Novo</option>
              </select>
            </label>
            <label className="field">
              <span>Moč (kW)</span>
              <input name="powerKw" type="number" step="0.1" value={powerKw} onChange={(e) => setPowerKw(e.target.value)} />
            </label>
            <label className="field">
              <span>Konji (KM)</span>
              <input name="powerHp" type="number" step="0.1" value={powerHp} onChange={(e) => setPowerHp(e.target.value)} />
            </label>
          </div>

          {/* Prilepi specifikacije */}
          <div className="mt-2 grid gap-4 rounded-[12px] border border-black/10 bg-[#f8f9fa] p-4">
            <label className="field">
              <span>Prilepi specifikacije (Avto.net)</span>
              <textarea
                name="specs"
                rows={10}
                value={specsText}
                onChange={(e) => handleSpecsChange(e.target.value)}
                placeholder={EXAMPLE_SPECS}
                className="font-mono text-sm"
              />
              <small className="text-xs text-ink/65">
                Kopiraj tabelo podatkov z Avto.net (npr. Starost, Motor, Moč motorja, Menjalnik, Kategorija, Barva ...) in jo prilepi sem. Prazne vrstice (npr. brez kilometrov ali interne številke) se samodejno izpustijo.
              </small>
            </label>

            {parsedTable.length > 0 ? (
              <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
                <div className="border-b border-black/10 bg-[#171a1f] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
                  Predogled tabele specifikacij ({parsedTable.length} vrstic)
                </div>
                <dl className="divide-y divide-black/10 text-sm">
                  {parsedTable.map((row, idx) => (
                    <div key={`${row.label}-${idx}`} className="grid grid-cols-[10rem_1fr] gap-3 px-4 py-2.5 sm:grid-cols-[13rem_1fr]">
                      <dt className="font-semibold text-ink/70">{row.label}:</dt>
                      <dd className="font-medium text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          <label className="field">
            <span>Opis</span>
            <textarea
              name="description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </section>

        <section className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Fotografije</h2>
          {bike ? (
            <PhotoManager motorcycleId={bike.id} images={bike.images} />
          ) : (
            <label className="field">
              <span>Dodaj slike</span>
              <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple />
              <small className="text-sm text-ink/60">
                Izberi lahko več fotografij hkrati. JPG, PNG ali WebP, posamezna do 8 MB. Prva je naslovna. Na strani motorja jih obiskovalec lista levo in desno.
              </small>
            </label>
          )}
          <label className="flex min-h-12 items-center gap-3">
            <input className="size-5" type="checkbox" name="featured" defaultChecked={bike?.featured ?? false} />
            Pokaži tudi na naslovnici
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button className="btn btn-primary" name="intent" value="publish" disabled={pending}>
              {pending ? "Objavljam ..." : published ? "Shrani in posodobi stran" : "Objavi na stran"}
            </button>
            {bike ? (
              <Link
                className="btn btn-secondary"
                href={`/admin/motorji/${bike.id}/predogled`}
                onClick={(event) => {
                  if (unsaved && !window.confirm("Imaš neshranjene spremembe. Želiš vseeno zapustiti stran?")) event.preventDefault();
                }}
              >
                Predogled
              </Link>
            ) : null}
          </div>
          {pending ? <p role="status">Shranjujem in posodabljam ponudbo ...</p> : null}
        </section>
      </form>
    </div>
  );
}
