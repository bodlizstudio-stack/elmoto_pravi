import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { CompareActions, type CompareBikeItem } from "@/components/compare-button";
import { Gallery } from "@/components/gallery";
import { MotoCard } from "@/components/moto-card";
import { ShareButton } from "@/components/share-button";
import { getBikeBySlug, publicChoices, relatedBikes } from "@/lib/motorcycles";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import {
  conditionLabel,
  coverOf,
  displayName,
  factualSummary,
  formatCc,
  formatKm,
  formatPower,
  formatPrice,
  lines,
  statusLabel,
  stockLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bike = await getBikeBySlug(slug);
  if (!bike || !bike.forSale) notFound();
  const name = displayName(bike);
  const title = bike.seoTitle || (bike.status === "SOLD" ? `${name} (prodano)` : name);
  const description = bike.seoDescription || factualSummary(bike);
  return {
    title,
    description,
    alternates: { canonical: `/motorji/${bike.slug}` },
    openGraph: { title, description, url: `/motorji/${bike.slug}` },
  };
}

export default async function MotorcyclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bike = await getBikeBySlug(slug);
  if (!bike || !bike.forSale) notFound();
  const [related, settings, choices] = await Promise.all([relatedBikes(bike), getSettings(), publicChoices()]);
  const name = displayName(bike);
  const sold = bike.status === "SOLD";
  const cover = coverOf(bike);
  const externalUrl = (bike.sourceUrl || (bike.source?.startsWith("http") ? bike.source : "")).trim();

  const compareItem: CompareBikeItem = {
    id: bike.id,
    slug: bike.slug,
    brand: bike.brand,
    model: bike.model,
    variant: bike.variant,
    year: bike.year,
    mileageKm: bike.mileageKm,
    engineCc: bike.engineCc,
    powerKw: bike.powerKw,
    powerHp: bike.powerHp,
    transmission: bike.transmission,
    driveType: bike.driveType,
    color: bike.color,
    licenseCategory: bike.licenseCategory,
    category: bike.category,
    condition: bike.condition,
    status: bike.status,
    priceCents: bike.priceConfirmed && bike.priceCents && bike.priceCents > 0 ? bike.priceCents : null,
    priceConfirmed: Boolean(bike.priceConfirmed && bike.priceCents && bike.priceCents > 0),
    image: cover?.url ?? null,
    sourceUrl: externalUrl || undefined,
  };

  const baseRows = (
    [
      ["Znamka", bike.brand],
      ["Model", bike.model],
      ["Različica", bike.variant],
      ["Letnik", bike.year ? String(bike.year) : ""],
      ["Stanje", conditionLabel(bike.condition)],
      ["Kilometri", formatKm(bike.mileageKm) || ""],
      ["Prostornina", formatCc(bike.engineCc) || ""],
      ["Moč motorja", formatPower(bike.powerKw, bike.powerHp) || ""],
      ["Tip motorja", bike.engineType],
      ["Menjalnik", bike.transmission],
      ["Prenos moči", bike.driveType],
      ["Kategorija", bike.category],
      ["Barva", bike.color],
      ["Kategorija dovoljenja", bike.licenseCategory],
      ["Razpoložljivost", stockLabel(bike.status)],
    ] as [string, string][]
  ).filter(([, value]) => Boolean(value));

  // Merge pasted specifications with base fields so every entered detail appears in the table
  const specRows: { label: string; value: string }[] = [];
  const seenLabels = new Set<string>();

  for (const [label, value] of baseRows) {
    if (label === "Znamka" || label === "Model" || label === "Letnik") {
      specRows.push({ label, value });
      seenLabels.add(label.toLowerCase());
    }
  }

  for (const spec of bike.specifications) {
    const norm = spec.label.trim().toLowerCase();
    if (!seenLabels.has(norm)) {
      specRows.push({ label: spec.label, value: spec.value });
      seenLabels.add(norm);
    }
  }

  for (const [label, value] of baseRows) {
    const norm = label.toLowerCase();
    const alreadyCovered =
      seenLabels.has(norm) ||
      (norm === "stanje" && seenLabels.has("starost")) ||
      (norm === "kilometri" && seenLabels.has("prevoženi km")) ||
      (norm === "prostornina" && seenLabels.has("motor"));
    if (!alreadyCovered) {
      specRows.push({ label, value });
      seenLabels.add(norm);
    }
  }

  const equipment = lines(bike.equipment);
  const offer =
    bike.priceConfirmed && bike.priceCents && bike.priceCents > 0
      ? {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: (bike.priceCents / 100).toFixed(2),
          ...(bike.status === "AVAILABLE" || bike.status === "RESERVED" || sold
            ? {
                availability: sold
                  ? "https://schema.org/SoldOut"
                  : bike.status === "RESERVED"
                    ? "https://schema.org/LimitedAvailability"
                    : "https://schema.org/InStock",
              }
            : {}),
        }
      : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: bike.description || factualSummary(bike),
    brand: { "@type": "Brand", name: bike.brand },
    category: bike.category || undefined,
    image: bike.images.map((image) => (image.url.startsWith("http") ? image.url : `${siteUrl()}${image.url}`)),
    offers: offer,
  };

  return (
    <article className="bg-paper pb-28 text-ink md:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap py-8">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { href: "/motorji", label: "Motorji" }, { label: name }]} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <Gallery images={bike.images.map((image) => ({ url: image.url, alt: image.alt || name }))} title={name} />
          <div>
            {bike.status === "UNKNOWN" ? null : statusLabel(bike.status) ? (
              <p className="text-xs uppercase tracking-[0.18em] text-accent">{statusLabel(bike.status)}</p>
            ) : null}
            <h1 className="display mt-2 text-5xl sm:text-6xl">{name}</h1>
            <p className="mt-4 display text-4xl">{formatPrice(bike.priceCents, bike.priceConfirmed)}</p>
            {sold ? (
              <p className="mt-4 rounded-[12px] border border-white/10 bg-[#25272D] p-4 leading-7 text-[#B9BDC5]">
                To vozilo je prodano in ni več na voljo za nakup.
              </p>
            ) : bike.status === "RESERVED" ? (
              <p className="mt-4 rounded-[12px] border border-white/10 bg-[#25272D] p-4 leading-7 text-[#B9BDC5]">
                Vozilo je označeno kot rezervirano. Povpraševanje lahko vseeno pošlješ.
              </p>
            ) : null}

            {specRows.length > 0 ? (
              <div className="mt-6 overflow-hidden rounded-[12px] border border-white/10 bg-[#25272D]">
                <div className="border-b border-white/10 bg-[#1B1D22] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
                  Osnovni podatki in specifikacije
                </div>
                <dl className="divide-y divide-white/10 text-sm">
                  {specRows.map((spec, idx) => (
                    <div
                      key={`${spec.label}-${idx}`}
                      className="grid grid-cols-[7.75rem_1fr] gap-2.5 px-3.5 py-2.5 sm:grid-cols-[11.5rem_1fr] sm:gap-3 sm:px-4"
                    >
                      <dt className="font-semibold text-[#B9BDC5]">{spec.label}:</dt>
                      <dd className="break-words font-medium text-white">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="mt-6">
              <CompareActions id={bike.id} bike={compareItem} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full"
                >
                  Poglej oglas na Avto.net ↗
                </a>
              ) : null}
              {!sold ? (
                <>
                  <a className={`btn ${externalUrl ? "btn-dark" : "btn-primary"} w-full`} href="#povprasevanje">
                    Pošlji povpraševanje
                  </a>
                  <a className="btn btn-dark w-full" href="#povprasevanje">
                    Dogovori se za ogled
                  </a>
                </>
              ) : (
                <Link className="btn btn-dark w-full" href="/motorji">
                  Poglej druge motorje
                </Link>
              )}
              <a className="btn btn-dark w-full" href={`tel:${settings.phoneTel}`}>
                Pokliči prodajalca ({settings.phoneDisplay})
              </a>
              <ShareButton title={name} />
            </div>
          </div>
        </div>

        <section className="mt-12 max-w-3xl">
          <h2 className="display text-4xl">Opis motorja</h2>
          {bike.description ? (
            <p className="prose-copy mt-4 whitespace-pre-line">{bike.description}</p>
          ) : (
            <p className="mt-4 leading-7">{factualSummary(bike)}</p>
          )}
          {equipment.length ? (
            <>
              <h3 className="display mt-8 text-3xl">Oprema</h3>
              <ul className="mt-3 list-disc pl-5 leading-7">
                {equipment.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}
          {bike.serviceHistory ? (
            <>
              <h3 className="display mt-8 text-3xl">Servisna zgodovina</h3>
              <p className="prose-copy mt-3">{bike.serviceHistory}</p>
            </>
          ) : null}
        </section>

        {!sold ? (
          <section id="povprasevanje" className="mt-12 max-w-2xl scroll-mt-24 rounded-[14px] border border-white/10 bg-[#1B1D22] p-5 sm:p-7">
            <h2 className="display text-4xl text-white">Povpraševanje</h2>
            <p className="mt-2 mb-5 text-sm leading-6 text-[#B9BDC5]">
              Obrazec je izpolnjen za ta motor. Oddaja ni potrditev nakupa.
            </p>
            <ContactForm
              dark
              initialType="PURCHASE"
              initialMotorcycleId={bike.id}
              motorcycles={choices.map((item) => ({ id: item.id, label: displayName(item) }))}
            />
          </section>
        ) : null}

        {related.length ? (
          <section className="mt-14">
            <h2 className="display text-4xl text-white">Podobni motorji</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <MotoCard key={item.id} bike={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <div className="dock fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#111216] p-3 text-[#F5F5F5] md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <a className="btn btn-primary" href={`tel:${settings.phoneTel}`}>
            Pokliči
          </a>
          {externalUrl ? (
            <a className="btn btn-secondary" href={externalUrl} target="_blank" rel="noopener noreferrer">
              Avto.net ↗
            </a>
          ) : sold ? (
            <Link className="btn btn-secondary" href="/motorji">
              Drugi motorji
            </Link>
          ) : (
            <a className="btn btn-secondary" href="#povprasevanje">
              Povpraševanje
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
