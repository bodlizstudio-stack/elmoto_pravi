"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  ExternalLink as ExternalLinkIcon,
  ImagePlus,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
  Wrench,
} from "lucide-react";
import { PhotoManager } from "@/components/photo-manager";
import { saveMotorcycle, type ActionState } from "@/lib/actions/admin";
import type { AvtoNetImportResponse, ImportedAvtoNetBike } from "@/lib/avtonet-import";
import { publicationLabel } from "@/lib/offer";

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
  firstRegistration?: string;
  mileageKm: number | null;
  engineCc: number | null;
  powerKw: number | null;
  powerHp: number | null;
  fuelType?: string;
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
  sourcePlatform?: string;
  sourceUrl?: string;
  externalId?: string;
  importStatus?: string;
  syncEnabled?: boolean;
  sourceCheckedAt: string;
  specs: string;
  images: Photo[];
};

type FormValues = {
  brand: string;
  model: string;
  variant: string;
  year: string;
  firstRegistration: string;
  mileageKm: string;
  engineCc: string;
  powerKw: string;
  powerHp: string;
  priceEur: string;
  condition: string;
  category: string;
  fuelType: string;
  engineType: string;
  transmission: string;
  driveType: string;
  color: string;
  licenseCategory: string;
  description: string;
  equipment: string;
  serviceHistory: string;
  specs: string;
  sourcePlatform: string;
  sourceUrl: string;
  externalId: string;
  importStatus: string;
  syncEnabled: boolean;
  featured: boolean;
};

function initialValuesFromBike(bike?: EditableBike): FormValues {
  const price = bike?.priceCents && bike.priceCents > 0 ? String(bike.priceCents / 100) : "";
  return {
    brand: bike?.brand ?? "",
    model: bike?.model ?? "",
    variant: bike?.variant ?? "",
    year: bike?.year != null ? String(bike.year) : "",
    firstRegistration: bike?.firstRegistration ?? "",
    mileageKm: bike?.mileageKm != null ? String(bike.mileageKm) : "",
    engineCc: bike?.engineCc != null ? String(bike.engineCc) : "",
    powerKw: bike?.powerKw != null ? String(bike.powerKw) : "",
    powerHp: bike?.powerHp != null ? String(bike.powerHp) : "",
    priceEur: price,
    condition: bike?.condition || "",
    category: bike?.category ?? "",
    fuelType: bike?.fuelType ?? "",
    engineType: bike?.engineType ?? "",
    transmission: bike?.transmission ?? "",
    driveType: bike?.driveType ?? "",
    color: bike?.color ?? "",
    licenseCategory: bike?.licenseCategory ?? "",
    description: bike?.description || bike?.cardSummary || "",
    equipment: bike?.equipment ?? "",
    serviceHistory: bike?.serviceHistory ?? "",
    specs: bike?.specs ?? "",
    sourcePlatform: bike?.sourcePlatform ?? "",
    sourceUrl: bike?.sourceUrl || bike?.source || "",
    externalId: bike?.externalId ?? "",
    importStatus: bike?.importStatus ?? "",
    syncEnabled: bike?.syncEnabled ?? false,
    featured: bike?.featured ?? false,
  };
}

export function MotorcycleEditor({
  bike,
  initialMode = "avtonet",
}: {
  bike?: EditableBike;
  initialMode?: "avtonet" | "manual";
}) {
  const [state, action, pending] = useActionState(saveMotorcycle, null as ActionState);
  const [mode, setMode] = useState<"avtonet" | "manual">(bike ? "manual" : initialMode);
  const [values, setValues] = useState<FormValues>(() => initialValuesFromBike(bike));
  const [targetBikeId, setTargetBikeId] = useState<string>(bike?.id ?? "");
  const [dirty, setDirty] = useState(false);

  // Avto.net importer state
  const [avtoNetUrl, setAvtoNetUrl] = useState(bike?.sourceUrl || "");
  const [pastedContent, setPastedContent] = useState("");
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const [duplicateOffer, setDuplicateOffer] = useState<{
    id: string;
    slug: string;
    title: string;
    updatedAt: string;
    pendingData: ImportedAvtoNetBike;
  } | null>(null);
  const [importedPreview, setImportedPreview] = useState<ImportedAvtoNetBike | null>(null);
  const [syncSupported, setSyncSupported] = useState(false);

  // Pre-save image management for imported & local images
  const [importedImages, setImportedImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [localPreviews, setLocalPreviews] = useState<{ name: string; url: string }[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const unsaved = dirty || Boolean(state?.error);
  const published = bike?.publication === "PUBLISHED";

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!unsaved) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [unsaved]);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setDirty(true);
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "powerKw" && typeof value === "string") {
        const kw = Number(value.replace(",", "."));
        if (Number.isFinite(kw) && kw > 0 && !prev.powerHp) {
          next.powerHp = String(Math.round(kw * 1.35962));
        }
      }
      return next;
    });
  }

  function applyImportedData(data: ImportedAvtoNetBike, existingId?: string) {
    if (existingId) {
      setTargetBikeId(existingId);
    }
    setImportedPreview(data);
    setImportedImages(data.imageUrls || []);
    setCoverIndex(0);
    setDirty(true);
    setValues((prev) => ({
      ...prev,
      brand: data.brand || prev.brand,
      model: data.model || prev.model,
      variant: data.variant || prev.variant,
      year: data.year != null ? String(data.year) : prev.year,
      firstRegistration: data.firstRegistration || prev.firstRegistration,
      mileageKm: data.mileageKm != null ? String(data.mileageKm) : prev.mileageKm,
      engineCc: data.engineCc != null ? String(data.engineCc) : prev.engineCc,
      powerKw: data.powerKw != null ? String(data.powerKw) : prev.powerKw,
      powerHp: data.powerHp != null ? String(data.powerHp) : prev.powerHp,
      priceEur: data.priceEur || prev.priceEur,
      condition: data.condition || prev.condition,
      category: data.category || prev.category,
      fuelType: data.fuelType || prev.fuelType,
      engineType: data.engineType || prev.engineType,
      transmission: data.transmission || prev.transmission,
      driveType: data.driveType || prev.driveType,
      color: data.color || prev.color,
      licenseCategory: data.licenseCategory || prev.licenseCategory,
      description: data.description || prev.description,
      equipment: data.equipment || prev.equipment,
      serviceHistory: data.serviceHistory || prev.serviceHistory,
      specs: data.specs || prev.specs,
      sourcePlatform: "Avto.net",
      sourceUrl: data.sourceUrl,
      externalId: data.externalId,
      importStatus: data.importStatus,
      syncEnabled: false,
    }));
  }

  async function handleAvtoNetImport() {
    setImportNotice(null);
    setDuplicateOffer(null);
    const trimmed = avtoNetUrl.trim();
    if (!trimmed) {
      setImportNotice({
        type: "error",
        text: "Vnesite veljavno povezavo do oglasa na Avto.net.",
      });
      return;
    }

    setImporting(true);
    try {
      const response = await fetch("/api/admin/avtonet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          pastedContent,
        }),
      });
      const result = (await response.json()) as AvtoNetImportResponse;
      setSyncSupported(Boolean(result.syncSupported));

      if (!response.ok || !result.ok || !result.data) {
        setImportNotice({
          type: "error",
          text: result.error || "Podatkov oglasa ni bilo mogoče pridobiti.",
        });
        return;
      }

      if (result.cloudflareBlocked) {
        setShowPasteFallback(true);
      }

      // Check if duplicate exists and we're not already editing that exact bike
      if (result.duplicate && result.duplicate.id !== targetBikeId) {
        setDuplicateOffer({
          ...result.duplicate,
          pendingData: result.data,
        });
        setImportNotice({
          type: "warning",
          text: "Ta motor je že dodan. Želite posodobiti njegove podatke?",
        });
        return;
      }

      applyImportedData(result.data);
      if (result.warning) {
        setImportNotice({
          type: "warning",
          text: result.warning,
        });
      } else {
        setImportNotice({
          type: "success",
          text: "Uvoz je bil uspešen. Preverite podatke pred shranjevanjem.",
        });
      }
    } catch {
      setImportNotice({
        type: "error",
        text: "Podatkov oglasa ni bilo mogoče pridobiti.",
      });
    } finally {
      setImporting(false);
    }
  }

  function moveImportedImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= importedImages.length) return;
    setImportedImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
    if (coverIndex === index) setCoverIndex(target);
    else if (coverIndex === target) setCoverIndex(index);
  }

  function removeImportedImage(index: number) {
    setImportedImages((prev) => prev.filter((_, i) => i !== index));
    if (coverIndex === index) setCoverIndex(0);
    else if (coverIndex > index) setCoverIndex((c) => Math.max(0, c - 1));
  }

  function addManualImageUrl() {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        setImportNotice({ type: "error", text: "Vnesite veljavno HTTPS povezavo do fotografije." });
        return;
      }
      setImportedImages((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
      setNewImageUrl("");
      setDirty(true);
    } catch {
      setImportNotice({ type: "error", text: "Vnesite veljavno povezavo do fotografije." });
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">
            {bike ? "Uredi motor" : "Dodaj motor"}
          </h1>
          {bike ? (
            <p className="mt-2 text-sm text-ink/70">
              Stanje objave: {publicationLabel(bike.publication)}
              {bike.sourcePlatform ? ` · Vir: ${bike.sourcePlatform}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink/70">
              Izberi uvoz oglasa iz Avto.net ali ročno vnesi podatke o motorju.
            </p>
          )}
        </div>
        <Link
          href="/admin"
          className="btn btn-secondary"
          onClick={(event) => {
            if (unsaved && !window.confirm("Imaš neshranjene spremembe. Želiš vseeno zapustiti stran?")) {
              event.preventDefault();
            }
          }}
        >
          Nazaj na ponudbo
        </Link>
      </div>

      {/* Mode Switcher: Option A (Uvozi iz Avto.net) vs Option B (Ročno dodajanje) */}
      <div className="grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Način dodajanja motorja">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "avtonet"}
          onClick={() => setMode("avtonet")}
          className={`flex items-center justify-between rounded-[12px] border p-4 text-left transition ${
            mode === "avtonet"
              ? "border-[#ec2336] bg-white shadow-[0_8px_24px_rgba(236,35,54,0.08)]"
              : "border-black/10 bg-white/70 hover:bg-white"
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#ec2336]">Možnost A</span>
            <p className="mt-1 text-lg font-semibold text-ink">Uvozi iz Avto.net</p>
            <p className="mt-0.5 text-sm text-ink/65">
              Prilepi povezavo do oglasa na Avto.net in samodejno izpolni obrazec.
            </p>
          </div>
          <Download aria-hidden className="h-6 w-6 shrink-0 text-[#ec2336]" />
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === "manual"}
          onClick={() => setMode("manual")}
          className={`flex items-center justify-between rounded-[12px] border p-4 text-left transition ${
            mode === "manual"
              ? "border-[#16181c] bg-white shadow-[0_8px_24px_rgba(22,24,28,0.06)]"
              : "border-black/10 bg-white/70 hover:bg-white"
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ink/60">Možnost B</span>
            <p className="mt-1 text-lg font-semibold text-ink">Ročno dodajanje</p>
            <p className="mt-0.5 text-sm text-ink/65">
              Klasični vnos podatkov in nalaganje fotografij iz računalnika ali telefona.
            </p>
          </div>
          <Wrench aria-hidden className="h-6 w-6 shrink-0 text-ink/70" />
        </button>
      </div>

      {/* OPTION A: Avto.net Import Panel */}
      {mode === "avtonet" ? (
        <section className="grid gap-4 rounded-[12px] border border-[#ec2336]/30 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#ec2336]">
                Avto.net uvoznik
              </span>
              <h2 className="mt-1 text-2xl font-semibold">Uvozi motor iz Avto.net</h2>
            </div>
            <a
              href="https://www.avto.net/EL-MOTO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ec2336] underline"
            >
              Odpri EL-MOTO oglase na Avto.net
              <ExternalLinkIcon aria-hidden className="h-4 w-4" />
            </a>
          </div>

          <p className="text-sm leading-6 text-ink/70">
            Prilepi povezavo (URL) do oglasa motornega kolesa na Avto.net in klikni{" "}
            <strong>Uvozi podatke</strong>. Vsa uvožena polja lahko pred shranjevanjem pregledaš in urediš.
          </p>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="field">
              <span>Povezava do oglasa na Avto.net (URL)</span>
              <input
                type="url"
                value={avtoNetUrl}
                onChange={(e) => setAvtoNetUrl(e.target.value)}
                placeholder="https://www.avto.net/Ads/details.asp?id=...&display=..."
                disabled={importing}
              />
            </label>
            <button
              type="button"
              onClick={() => void handleAvtoNetImport()}
              disabled={importing}
              className="btn btn-primary self-end min-h-12 px-6"
            >
              {importing ? (
                <>
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                  Uvažam podatke ...
                </>
              ) : (
                <>
                  <Download aria-hidden className="h-4 w-4" />
                  Uvozi podatke
                </>
              )}
            </button>
          </div>

          <div className="border-t border-black/10 pt-3">
            <button
              type="button"
              onClick={() => setShowPasteFallback((v) => !v)}
              className="text-sm font-semibold text-ink/80 underline decoration-[#ec2336] underline-offset-4"
            >
              {showPasteFallback
                ? "Skrij polje za lepljenje vsebine oglasa"
                : "Ali Avto.net zahteva CAPTCHA preverjanje? Prilepi besedilo ali HTML oglasa tukaj"}
            </button>

            {showPasteFallback ? (
              <div className="mt-3 grid gap-2 rounded-[10px] bg-[#f6f6f4] p-4">
                <p className="text-xs leading-5 text-ink/75">
                  <strong>Hitra pomoč (če Avto.net zaščita blokira neposreden bralnik):</strong> Odpri svoj oglas na
                  Avto.net, pritisni <kbd className="rounded border bg-white px-1.5 py-0.5">Ctrl+A</kbd> in{" "}
                  <kbd className="rounded border bg-white px-1.5 py-0.5">Ctrl+C</kbd> (ali prilepi izvorno HTML kodo s{" "}
                  <kbd className="rounded border bg-white px-1.5 py-0.5">Ctrl+U</kbd>), prilepi spodaj ter klikni{" "}
                  <strong>Uvozi podatke</strong>. Sistem bo samodejno razbral znamko, model, ceno, kilometre, moč,
                  opremo, opis in slike.
                </p>
                <textarea
                  rows={5}
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Tukaj prilepi kopirano besedilo ali HTML oglasa z Avto.net ..."
                  className="bg-white text-sm"
                />
              </div>
            ) : null}
          </div>

          {/* Notifications */}
          {importNotice ? (
            <div
              role="alert"
              className={`flex items-start gap-3 rounded-[10px] border p-4 text-sm ${
                importNotice.type === "error"
                  ? "border-accent/40 bg-[#fff5f5] text-accent"
                  : importNotice.type === "warning"
                    ? "border-amber-500/40 bg-amber-50 text-amber-950"
                    : "border-emerald-600/30 bg-emerald-50 text-emerald-950"
              }`}
            >
              {importNotice.type === "success" ? (
                <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <div className="grid gap-2">
                <p className="font-semibold">{importNotice.text}</p>
                {duplicateOffer ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      className="btn btn-primary min-h-10 px-4 text-xs"
                      onClick={() => {
                        applyImportedData(duplicateOffer.pendingData, duplicateOffer.id);
                        setDuplicateOffer(null);
                        setImportNotice({
                          type: "success",
                          text: "Uvoz je bil uspešen. Preverite podatke pred shranjevanjem (posodabljanje obstoječega motorja).",
                        });
                      }}
                    >
                      Posodobi obstoječi motor ({duplicateOffer.title})
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary min-h-10 px-4 text-xs"
                      onClick={() => {
                        setDuplicateOffer(null);
                        setImportNotice(null);
                      }}
                    >
                      Prekliči
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Imported Motorcycle Preview Summary */}
          {importedPreview ? (
            <div className="rounded-[12px] border border-black/10 bg-[#f8f9fa] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink/60">
                    Predogled uvoženih podatkov
                  </span>
                  <h3 className="text-lg font-semibold">
                    {values.brand || "—"} {values.model || "—"} {values.variant}
                  </h3>
                </div>
                {values.externalId ? (
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-ink/70">
                    Avto.net ID: #{values.externalId}
                  </span>
                ) : null}
              </div>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
                <div>
                  <dt className="text-xs text-ink/60">Znamka in model</dt>
                  <dd className="font-semibold">
                    {values.brand || "Ni podatka"} {values.model}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/60">Letnik / 1. reg.</dt>
                  <dd className="font-semibold">
                    {values.year || "—"} {values.firstRegistration ? `(${values.firstRegistration})` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/60">Cena</dt>
                  <dd className="font-semibold">
                    {values.priceEur ? `${values.priceEur} €` : "Cena na povpraševanje"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/60">Prevoženi kilometri</dt>
                  <dd className="font-semibold">
                    {values.mileageKm ? `${values.mileageKm} km` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/60">Prostornina motorja</dt>
                  <dd className="font-semibold">
                    {values.engineCc ? `${values.engineCc} ccm` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/60">Moč motorja</dt>
                  <dd className="font-semibold">
                    {values.powerKw ? `${values.powerKw} kW` : "—"}
                    {values.powerHp ? ` (${values.powerHp} KM)` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/60">Stanje</dt>
                  <dd className="font-semibold">
                    {values.condition === "NEW"
                      ? "Novo"
                      : values.condition === "USED"
                        ? "Rabljeno"
                        : "Ni izbrano"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/60">Fotografije</dt>
                  <dd className="font-semibold">
                    {importedImages.length + localPreviews.length} pripravljenih
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </section>
      ) : null}

      {state?.error ? (
        <p className="border border-accent/40 bg-white p-3 text-sm text-accent" role="alert">
          {state.error}
        </p>
      ) : null}

      {/* Main Editable Form (used by both Option A & Option B) */}
      <form
        action={action}
        className="grid gap-6"
        onChange={() => setDirty(true)}
        onSubmit={() => setDirty(false)}
      >
        {targetBikeId ? <input type="hidden" name="id" value={targetBikeId} /> : null}
        <input type="hidden" name="sourcePlatform" value={values.sourcePlatform} />
        <input type="hidden" name="sourceUrl" value={values.sourceUrl} />
        <input type="hidden" name="externalId" value={values.externalId} />
        <input type="hidden" name="importStatus" value={values.importStatus} />
        <input type="hidden" name="importedImages" value={JSON.stringify(importedImages)} />
        <input type="hidden" name="coverIndex" value={String(coverIndex)} />

        {/* 1. Osnovni podatki */}
        <section className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Osnovni podatki o motorju</h2>
            {targetBikeId && !bike ? (
              <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                Posodabljanje obstoječega zapisa
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-ink/70">
            Obvezna sta znamka in model. Vsa polja lahko pred shranjevanjem poljubno urediš ali dopolniš.
          </p>
          {bike?.publication === "ARCHIVED" ? (
            <p className="text-sm leading-6">Ta motor je zdaj skrit. Shranjevanje ga spet pokaže na strani.</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ControlledField
              name="brand"
              label="Znamka *"
              value={values.brand}
              onChange={(v) => updateField("brand", v)}
              required
              placeholder="npr. Yamaha, Honda, BMW"
            />
            <ControlledField
              name="model"
              label="Model *"
              value={values.model}
              onChange={(v) => updateField("model", v)}
              required
              placeholder="npr. MT-07, Tracer 9 GT"
            />
            <ControlledField
              name="variant"
              label="Različica / podmodel"
              value={values.variant}
              onChange={(v) => updateField("variant", v)}
              placeholder="npr. ABS, DCT, Pure"
            />
            <ControlledField
              name="priceEur"
              label="Cena (EUR)"
              value={values.priceEur}
              onChange={(v) => updateField("priceEur", v)}
              hint="Prazno pomeni ceno na povpraševanje."
              placeholder="npr. 6990"
            />
            <ControlledField
              name="year"
              label="Letnik proizvodnje"
              type="number"
              value={values.year}
              onChange={(v) => updateField("year", v)}
              placeholder="npr. 2022"
            />
            <ControlledField
              name="firstRegistration"
              label="Prva registracija"
              value={values.firstRegistration}
              onChange={(v) => updateField("firstRegistration", v)}
              placeholder="npr. 05 / 2022"
            />
            <label className="field">
              <span>Stanje (novo ali rabljeno)</span>
              <select
                name="condition"
                value={values.condition}
                onChange={(e) => updateField("condition", e.target.value)}
              >
                <option value="">Ni izbrano</option>
                <option value="USED">Rabljeno</option>
                <option value="NEW">Novo</option>
              </select>
            </label>
            <ControlledField
              name="category"
              label="Kategorija motorja"
              value={values.category}
              onChange={(v) => updateField("category", v)}
              placeholder="npr. Naked, Adventure, Skuter"
            />
            <ControlledField
              name="licenseCategory"
              label="Kategorija izpita"
              value={values.licenseCategory}
              onChange={(v) => updateField("licenseCategory", v)}
              placeholder="npr. A, A2, A1"
            />
          </div>
        </section>

        {/* 2. Tehnični podatki */}
        <section className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Tehnični podatki</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ControlledField
              name="mileageKm"
              label="Prevoženi kilometri (km)"
              type="number"
              value={values.mileageKm}
              onChange={(v) => updateField("mileageKm", v)}
              placeholder="npr. 12500"
            />
            <ControlledField
              name="engineCc"
              label="Prostornina motorja (ccm)"
              type="number"
              value={values.engineCc}
              onChange={(v) => updateField("engineCc", v)}
              placeholder="npr. 689"
            />
            <ControlledField
              name="powerKw"
              label="Moč motorja (kW)"
              type="number"
              step="0.1"
              value={values.powerKw}
              onChange={(v) => updateField("powerKw", v)}
              placeholder="npr. 54"
            />
            <ControlledField
              name="powerHp"
              label="Moč motorja (KM / HP)"
              type="number"
              step="0.1"
              value={values.powerHp}
              onChange={(v) => updateField("powerHp", v)}
              placeholder="npr. 73"
            />
            <ControlledField
              name="fuelType"
              label="Gorivo"
              value={values.fuelType}
              onChange={(v) => updateField("fuelType", v)}
              placeholder="npr. Bencin"
            />
            <ControlledField
              name="color"
              label="Barva"
              value={values.color}
              onChange={(v) => updateField("color", v)}
              placeholder="npr. Črna kovinska"
            />
            <ControlledField
              name="transmission"
              label="Menjalnik"
              value={values.transmission}
              onChange={(v) => updateField("transmission", v)}
              placeholder="npr. Ročni 6-stopenjski"
            />
            <ControlledField
              name="engineType"
              label="Vrsta motorja"
              value={values.engineType}
              onChange={(v) => updateField("engineType", v)}
              placeholder="npr. 4-taktni dvovaljnik"
            />
          </div>
        </section>

        {/* 3. Opis, oprema in podatki oglasa */}
        <section className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Opis in oprema oglasa</h2>
          <label className="field">
            <span>Opis motorja</span>
            <textarea
              name="description"
              rows={6}
              value={values.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Celoten opis motorja ..."
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="field">
              <span>Oprema in dodatki</span>
              <textarea
                name="equipment"
                rows={3}
                value={values.equipment}
                onChange={(e) => updateField("equipment", e.target.value)}
                placeholder="npr. ABS, kovčki, gretje ročk, quickshifter ..."
              />
            </label>
            <label className="field">
              <span>Servisna zgodovina in dodatni podatki</span>
              <textarea
                name="serviceHistory"
                rows={3}
                value={values.serviceHistory}
                onChange={(e) => updateField("serviceHistory", e.target.value)}
                placeholder="npr. 1. lastnik, potrjena servisna knjiga, nekaramboliran ..."
              />
            </label>
          </div>
          <label className="field">
            <span>Dodatne tehnične specifikacije (ena na vrstico v obliki Naziv: Vrednost)</span>
            <textarea
              name="specs"
              rows={4}
              value={values.specs}
              onChange={(e) => updateField("specs", e.target.value)}
              placeholder={"Prva registracija: 05/2022\nProstornina: 689 ccm\nGorivo: Bencin"}
            />
          </label>

          {/* Source & Optional Synchronization */}
          <div className="mt-2 rounded-[10px] border border-black/10 bg-[#f6f6f4] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RefreshCw aria-hidden className="h-4 w-4 text-ink/70" />
                <h3 className="text-sm font-semibold">Vir oglasa in sinhronizacija z Avto.net</h3>
              </div>
              {values.sourceUrl ? (
                <a
                  href={values.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#ec2336] underline"
                >
                  Izvirni oglas na Avto.net
                  <ExternalLinkIcon aria-hidden className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>

            {syncSupported ? (
              <label className="mt-3 flex min-h-10 items-center gap-3 text-sm">
                <input
                  className="size-4"
                  type="checkbox"
                  name="syncEnabled"
                  checked={values.syncEnabled}
                  onChange={(e) => updateField("syncEnabled", e.target.checked)}
                />
                <span>
                  Omogoči samodejno sinhronizacijo podatkov (cena, opis, kilometri, razpoložljivost) z Avto.net
                </span>
              </label>
            ) : (
              <p className="mt-2 text-xs leading-5 text-ink/65">
                Samodejna sinhronizacija v ozadju je privzeto <strong>izklopljena</strong> in trenutno ni na voljo,
                ker uradni Avto.net XML/API vir trgovca (<code>AVTONET_FEED_URL</code>) ni povezan. Posodobitev
                lahko kadarkoli sprožiš ročno z ponovnim uvozom povezave.
              </p>
            )}
          </div>
        </section>

        {/* 4. Fotografije */}
        <section className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Fotografije</h2>

          {bike ? (
            <PhotoManager motorcycleId={bike.id} images={bike.images} />
          ) : null}

          {/* Imported / Pre-save Image Gallery */}
          {!bike && importedImages.length > 0 ? (
            <div className="grid gap-3">
              <p className="text-sm font-semibold text-ink">
                Uvožene fotografije ({importedImages.length}) – ob shranjevanju se prenesejo in optimizirajo v shrambo strani:
              </p>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {importedImages.map((imgUrl, idx) => {
                  const isMain = idx === coverIndex;
                  return (
                    <li
                      key={`${imgUrl}-${idx}`}
                      className={`flex flex-col justify-between gap-2 rounded-[10px] border p-3 ${
                        isMain ? "border-[#ec2336] bg-[#fff8f8]" : "border-black/10 bg-[#f8f9fa]"
                      }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Uvožena fotografija ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {isMain ? (
                          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#ec2336] px-2 py-0.5 text-xs font-bold text-white">
                            <Star aria-hidden className="h-3 w-3 fill-current" />
                            Naslovna
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCoverIndex(idx)}
                          disabled={isMain}
                          className="btn btn-secondary min-h-9 px-2.5 text-xs"
                        >
                          Nastavi kot naslovno
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImportedImage(idx, -1)}
                          disabled={idx === 0}
                          aria-label="Premakni višje"
                          className="btn btn-secondary min-h-9 px-2 text-xs"
                        >
                          <ArrowUp aria-hidden className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImportedImage(idx, 1)}
                          disabled={idx === importedImages.length - 1}
                          aria-label="Premakni nižje"
                          className="btn btn-secondary min-h-9 px-2 text-xs"
                        >
                          <ArrowDown aria-hidden className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImportedImage(idx)}
                          aria-label="Odstrani fotografijo"
                          className="btn btn-secondary min-h-9 px-2 text-xs text-accent"
                        >
                          <Trash2 aria-hidden className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {/* Add direct Avto.net image URL or upload local files */}
          {!bike ? (
            <div className="grid gap-4">
              {mode === "avtonet" ? (
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <label className="field">
                    <span>Dodaj povezavo do fotografije z Avto.net (neobvezno)</span>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.avto.net/photo/..."
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addManualImageUrl}
                    className="btn btn-secondary self-end min-h-12"
                  >
                    <ImagePlus aria-hidden className="h-4 w-4" />
                    Dodaj sliko iz URL
                  </button>
                </div>
              ) : null}

              <label className="field">
                <span>Naloži fotografije iz računalnika ali telefona</span>
                <input
                  name="photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setLocalPreviews(
                      files.map((file) => ({
                        name: file.name,
                        url: URL.createObjectURL(file),
                      })),
                    );
                  }}
                />
                <small className="text-sm text-ink/60">
                  Izbereš lahko več fotografij hkrati (JPG, PNG ali WebP, posamezna do 8 MB). Ob shranjevanju se samodejno optimizirajo.
                </small>
              </label>

              {localPreviews.length > 0 ? (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
                    Izbrane datoteke za nalaganje ({localPreviews.length}):
                  </p>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {localPreviews.map((item) => (
                      <div key={item.url} className="overflow-hidden rounded-[8px] border border-black/10 bg-[#f6f6f4]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.name} className="aspect-[4/3] w-full object-cover" />
                        <p className="truncate px-2 py-1 text-xs text-ink/70">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <label className="flex min-h-12 items-center gap-3">
            <input
              className="size-5"
              type="checkbox"
              name="featured"
              checked={values.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
            />
            Pokaži tudi med izpostavljenimi na naslovnici
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button className="btn btn-primary" name="intent" value="publish" disabled={pending}>
              {pending ? "Shranjujem motor ..." : published ? "Shrani motor" : "Shrani motor"}
            </button>
            {bike ? (
              <Link
                className="btn btn-secondary"
                href={`/admin/motorji/${bike.id}/predogled`}
                onClick={(event) => {
                  if (unsaved && !window.confirm("Imaš neshranjene spremembe. Želiš vseeno zapustiti stran?")) {
                    event.preventDefault();
                  }
                }}
              >
                Predogled
              </Link>
            ) : null}
          </div>
          {pending ? <p role="status">Shranjujem motor in posodabljam ponudbo na spletni strani ...</p> : null}
        </section>
      </form>
    </div>
  );
}

function ControlledField({
  name,
  label,
  value,
  onChange,
  type = "text",
  step,
  required = false,
  hint,
  placeholder,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <small className="text-sm text-ink/60">{hint}</small> : null}
    </label>
  );
}
