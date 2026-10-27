"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { PhotoManager } from "@/components/photo-manager";
import { saveMotorcycle, type ActionState } from "@/lib/actions/admin";
import { publicationLabel } from "@/lib/offer";
import { extractMileageFromText, parseSpecs } from "@/lib/utils";

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
  sourceUrl?: string;
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

  const [brand, setBrand] = useState(bike?.brand ?? "");
  const [model, setModel] = useState(bike?.model ?? "");
  const [year, setYear] = useState(bike?.year != null ? String(bike.year) : "");
  const [mileageKm, setMileageKm] = useState(bike?.mileageKm != null ? String(bike.mileageKm) : "");
  const [mileageManuallyEdited, setMileageManuallyEdited] = useState(bike?.mileageKm != null);
  const [engineCc, setEngineCc] = useState(bike?.engineCc != null ? String(bike.engineCc) : "");
  const [powerKw, setPowerKw] = useState(bike?.powerKw != null ? String(bike.powerKw) : "");
  const [powerHp, setPowerHp] = useState(bike?.powerHp != null ? String(bike.powerHp) : "");
  const [priceEur, setPriceEur] = useState(
    bike?.priceCents && bike.priceCents > 0 ? String(bike.priceCents / 100) : "",
  );
  const [condition, setCondition] = useState(bike?.condition || "");
  const [status, setStatus] = useState(
    bike?.status && ["AVAILABLE", "RESERVED", "SOLD"].includes(bike.status) ? bike.status : "AVAILABLE",
  );
  const [category, setCategory] = useState(bike?.category ?? "");
  const [color, setColor] = useState(bike?.color ?? "");
  const [transmission, setTransmission] = useState(bike?.transmission ?? "");
  const [driveType, setDriveType] = useState(bike?.driveType ?? "");
  const [engineType, setEngineType] = useState(bike?.engineType ?? "");
  const [sourceUrl, setSourceUrl] = useState(bike?.sourceUrl || bike?.source || "");
  const [featured, setFeatured] = useState(bike?.featured ?? true);
  const [featuredOrder, setFeaturedOrder] = useState(bike?.featuredOrder != null ? String(bike.featuredOrder) : "0");
  const [specsText, setSpecsText] = useState(bike?.specs ?? "");
  const [description, setDescription] = useState(bike?.description || bike?.cardSummary || "");

  const parsedTable = parseSpecs(specsText);

  function handleSpecsChange(raw: string) {
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
        const km = extractMileageFromText(val) ?? (val.replace(/\./g, "").match(/\b(\d{1,6})\b/)?.[1] ? Number(val.replace(/\./g, "").match(/\b(\d{1,6})\b/)![1]) : null);
        if (km != null) setMileageKm(String(km));
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
      } else if (key.includes("cena") && !priceEur) {
        const cleaned = val.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
        const num = Number(cleaned);
        if (Number.isFinite(num) && num > 0) setPriceEur(String(Math.round(num)));
      }
    }
    if (!mileageManuallyEdited || !mileageKm) {
      const detected = extractMileageFromText(raw);
      if (detected != null) setMileageKm(String(detected));
    }
  }

  function handleDescriptionChange(raw: string) {
    setDescription(raw);
    const detected = extractMileageFromText(raw);
    if (detected != null && (!mileageManuallyEdited || !mileageKm)) {
      setMileageKm(String(detected));
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{bike ? "Uredi motor" : "Nov motor"}</h1>
          {bike ? <p className="mt-2 text-sm text-ink/70">Stanje objave: {publicationLabel(bike.publication)}</p> : null}
        </div>
        <Link href="/admin" className="btn btn-secondary">
          Nazaj na ponudbo
        </Link>
      </div>
      {state?.error ? (
        <p className="border border-accent/40 bg-white p-3 text-sm text-accent" role="alert">
          {state.error}
        </p>
      ) : null}
      <form action={action} className="grid gap-6">
        {bike ? <input type="hidden" name="id" value={bike.id} /> : null}
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
              <input
                name="mileageKm"
                type="number"
                value={mileageKm}
                onChange={(e) => {
                  const val = e.target.value;
                  setMileageKm(val);
                  setMileageManuallyEdited(val.trim().length > 0);
                }}
                placeholder="npr. 14500 (ali zaznano samodejno iz opisa)"
              />
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
              <span>Status oglasa</span>
              <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="AVAILABLE">Na voljo</option>
                <option value="RESERVED">Rezervirano</option>
                <option value="SOLD">Prodano</option>
              </select>
            </label>
            <label className="field">
              <span>Prostornina (ccm)</span>
              <input name="engineCc" type="number" value={engineCc} onChange={(e) => setEngineCc(e.target.value)} placeholder="npr. 498" />
            </label>
            <label className="field">
              <span>Moč (kW)</span>
              <input
                name="powerKw"
                type="number"
                step="0.1"
                value={powerKw}
                onChange={(e) => {
                  const val = e.target.value;
                  setPowerKw(val);
                  const kwNum = Number(val);
                  if (Number.isFinite(kwNum) && kwNum > 0) {
                    setPowerHp(String(Math.round(kwNum * 1.35962)));
                  }
                }}
                placeholder="npr. 35"
              />
            </label>
            <label className="field">
              <span>Konji (KM)</span>
              <input
                name="powerHp"
                type="number"
                step="0.1"
                value={powerHp}
                onChange={(e) => setPowerHp(e.target.value)}
                placeholder="npr. 48 (izračuna se tudi samodejno iz kW)"
              />
            </label>
            <label className="field">
              <span>Vrstni red prikaza na naslovnici</span>
              <input
                name="featuredOrder"
                type="number"
                value={featuredOrder}
                onChange={(e) => setFeaturedOrder(e.target.value)}
                placeholder="0"
              />
              <small className="text-sm text-ink/60">Manjša številka (npr. 1, 2, 3) prikaže motor višje v sekciji Novo v ponudbi.</small>
            </label>
            <label className="field sm:col-span-2">
              <span>Povezava do oglasa na Avto.net (direktni link do motorja)</span>
              <input
                name="sourceUrl"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://www.avto.net/Ads/details.asp?id=..."
              />
              <small className="text-sm text-ink/60">
                Ko je vpisana povezava do oglasa na Avto.net, klik na kartico motorja odpre ta konkretni oglas na Avto.net.
              </small>
            </label>
            <label className="flex items-center gap-3 rounded-[10px] border border-black/10 bg-[#f8f9fa] px-4 py-3 text-sm font-semibold sm:col-span-2">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-5 w-5 accent-[#E31B2B]"
              />
              <span>
                Prikaži na naslovnici v sekciji »NOVO V PONUDBI« (prikažejo se zadnji 3 dodani motorji — ob dodajanju novega se najstarejši samodejno umakne z naslovnice)
              </span>
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
            <span>Opis (če v opisu omeniš prevožene kilometre, npr. »14.500 km«, se polje Kilometri izpolni samodejno)</span>
            <textarea
              name="description"
              rows={6}
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          </label>
        </section>

        <section className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Fotografije</h2>
          <PhotoManager motorcycleId={bike?.id} images={bike?.images ?? []} />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button className="btn btn-primary" type="submit" name="intent" value="publish" disabled={pending}>
              {pending ? "Shranjujem objavo ..." : "Shrani objavo"}
            </button>
            {bike ? (
              <>
                <Link className="btn btn-secondary" href={`/motorji/${bike.slug}`} target="_blank">
                  Poglej oglas na strani ↗
                </Link>
                <Link className="btn btn-secondary" href={`/admin/motorji/${bike.id}/predogled`}>
                  Predogled v administraciji
                </Link>
              </>
            ) : null}
          </div>
          {pending ? <p role="status">Shranjujem in objavljam motor na stran ...</p> : null}
        </section>
      </form>
    </div>
  );
}
