import Link from "next/link";
import { PhotoFrame } from "@/components/photo";
import { CompareToggle, type CompareBikeItem } from "@/components/compare-button";
import type { PublicBike } from "@/lib/motorcycles";
import { conditionLabel, coverOf, displayName, formatCc, formatKm, formatPrice, statusLabel } from "@/lib/utils";

export function MotoCard({ bike, hrefBase = "/motorji" }: { bike: PublicBike; hrefBase?: string }) {
  const cover = coverOf(bike);
  const name = displayName(bike);
  const href = `${hrefBase}/${bike.slug}`;
  const specs = [bike.year ? String(bike.year) : "", formatKm(bike.mileageKm), formatCc(bike.engineCc)].filter(Boolean);
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

  return (
    <article className="moto-card flex h-full flex-col rounded-[12px] border border-black/10 bg-white text-ink">
      <div className="relative">
        <Link href={href} className="block">
          <PhotoFrame src={cover?.url} alt={cover?.alt || name} sizes="(min-width: 1280px) 380px, (min-width: 640px) 50vw, 100vw" fit="contain" />
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {conditionLabel(bike.condition) ? <Badge>{conditionLabel(bike.condition)}</Badge> : null}
          {bike.status === "RESERVED" || bike.status === "SOLD" ? <Badge>{statusLabel(bike.status)}</Badge> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h3 className="text-xl font-semibold leading-tight text-ink">
            <Link href={href} className="hover:text-accent">
              {name}
            </Link>
          </h3>
          {bike.cardSummary ? <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-ink/70">{bike.cardSummary}</p> : null}
          {specs.length ? <p className="mt-2 text-[15px] leading-6 text-ink/70">{specs.join(" · ")}</p> : null}
        </div>
        <p className="text-lg font-semibold text-ink">{formatPrice(bike.priceCents, bike.priceConfirmed)}</p>
        <div className="mt-auto grid gap-2">
          <Link href={href} className="btn btn-primary min-h-11 w-full">
            Ogled motorja
          </Link>
          {externalUrl ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary min-h-10 w-full text-sm font-semibold"
            >
              Oglas na Avto.net ↗
            </a>
          ) : null}
          <CompareToggle id={bike.id} bike={compareItem} />
        </div>
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">{children}</span>;
}
