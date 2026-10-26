"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { PhotoManager } from "@/components/photo-manager";
import { saveMotorcycle, type ActionState } from "@/lib/actions/admin";
import { publicationLabel } from "@/lib/offer";

type Photo = {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
  sortOrder: number;
};

type Bike = {
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

export function MotorcycleEditor({ bike }: { bike?: Bike }) {
  const [state, action, pending] = useActionState(saveMotorcycle, null as ActionState);
  const [dirty, setDirty] = useState(false);
  const unsaved = dirty || Boolean(state?.error);
  const price = bike?.priceCents && bike.priceCents > 0 ? String(bike.priceCents / 100) : "";
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
        <section className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold">Motor</h2>
          <p className="text-sm leading-6 text-ink/70">
            Obvezna sta znamka in model. Ostalo lahko pustiš prazno. Ko shraniš, se motor takoj pokaže v ponudbi, tudi ko je stran že na spletu.
          </p>
          {bike?.publication === "ARCHIVED" ? (
            <p className="text-sm leading-6">Ta motor je zdaj skrit. Shranjevanje ga spet pokaže na strani.</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="brand" label="Znamka" defaultValue={bike?.brand} required />
            <Field name="model" label="Model" defaultValue={bike?.model} required />
            <Field name="year" label="Letnik" type="number" defaultValue={bike?.year ?? ""} />
            <Field name="mileageKm" label="Kilometri" type="number" defaultValue={bike?.mileageKm ?? ""} />
            <Field name="priceEur" label="Cena (EUR)" defaultValue={price} hint="Prazno pomeni ceno na povpraševanje." />
            <Field name="powerKw" label="Moč (kW)" type="number" step="0.1" defaultValue={bike?.powerKw ?? ""} hint="Ni obvezno." />
            <Field name="powerHp" label="Konji (KM)" type="number" step="0.1" defaultValue={bike?.powerHp ?? ""} hint="Ni obvezno." />
            <label className="field">
              <span>Novo ali rabljeno</span>
              <select name="condition" defaultValue={bike?.condition || ""}>
                <option value="">Ni izbrano</option>
                <option value="USED">Rabljeno</option>
                <option value="NEW">Novo</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Opis</span>
            <textarea name="description" rows={6} defaultValue={bike?.description || bike?.cardSummary || ""} />
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

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  step,
  required = false,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  step?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} step={step} required={required} defaultValue={defaultValue ?? ""} />
      {hint ? <small className="text-sm text-ink/60">{hint}</small> : null}
    </label>
  );
}
