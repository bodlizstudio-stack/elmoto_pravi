import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PhotoFrame } from "@/components/photo";
import { CompareToggle, type CompareBikeItem } from "@/components/compare-button";
import type { PublicBike } from "@/lib/motorcycles";
import { conditionLabel, coverOf, displayName, formatCc, formatKm, formatPrice, statusLabel } from "@/lib/utils";

export function MotoCard({ bike, hrefBase = "/motorji" }: { bike: PublicBike; hrefBase?: string }) {
  const cover = coverOf(bike);
  const name = displayName(bike);
  const internalHref = `${hrefBase}/${bike.slug}`;
  const externalUrl = (bike.sourceUrl || (bike.source?.startsWith("http") ? bike.source : "")).trim();
  const primaryHref = externalUrl || internalHref;
  const isExternal = Boolean(externalUrl);
  const specs = [bike.year ? String(bike.year) : "", formatKm(bike.mileageKm), formatCc(bike.engineCc)].filter(Boolean);

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
    <article className="moto-card flex h-full flex-col rounded-[14px] border border-[#E2E5E9] bg-white text-[#16181C]">
      <div className="relative">
        {isExternal ? (
          <a href={primaryHref} target="_blank" rel="noopener noreferrer" className="block">
            <PhotoFrame
              src={cover?.url}
              alt={cover?.alt || name}
              sizes="(min-width: 1280px) 380px, (min-width: 640px) 50vw, 100vw"
              fit="cover"
            />
          </a>
        ) : (
          <Link href={primaryHref} className="block">
            <PhotoFrame
              src={cover?.url}
              alt={cover?.alt || name}
              sizes="(min-width: 1280px) 380px, (min-width: 640px) 50vw, 100vw"
              fit="cover"
            />
          </Link>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {conditionLabel(bike.condition) ? (
            <Badge variant={bike.condition === "NEW" ? "red" : "dark"}>{conditionLabel(bike.condition)}</Badge>
          ) : null}
          {bike.status === "RESERVED" || bike.status === "SOLD" ? <Badge variant="dark">{statusLabel(bike.status)}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h3 className="display text-2xl font-bold leading-tight tracking-wide text-[#16181C]">
            {isExternal ? (
              <a href={primaryHref} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#E31B2B]">
                {name}
              </a>
            ) : (
              <Link href={primaryHref} className="transition-colors hover:text-[#E31B2B]">
                {name}
              </Link>
            )}
          </h3>
          {specs.length ? (
            <p className="mt-2 text-sm font-medium text-[#5B616B]">{specs.join(" · ")}</p>
          ) : null}
          {bike.cardSummary ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5B616B]">{bike.cardSummary}</p>
          ) : null}
        </div>

        <p className="display mt-1 text-2xl font-bold text-[#16181C]">
          {formatPrice(bike.priceCents, bike.priceConfirmed)}
        </p>

        <div className="mt-auto grid gap-2 pt-2">
          {isExternal ? (
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary min-h-11 w-full"
            >
              <span>Ogled motorja</span>
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
          ) : (
            <Link href={primaryHref} className="btn btn-primary min-h-11 w-full">
              Ogled motorja
            </Link>
          )}
          {isExternal && hrefBase === "/motorji" ? (
            <Link href={internalHref} className="btn btn-secondary min-h-10 w-full text-sm">
              Podrobnosti in povpraševanje
            </Link>
          ) : null}
          <CompareToggle id={bike.id} bike={compareItem} />
        </div>
      </div>
    </article>
  );
}

function Badge({ children, variant = "dark" }: { children: React.ReactNode; variant?: "dark" | "red" }) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${
        variant === "red"
          ? "bg-[#E31B2B] text-white"
          : "border border-[#E2E5E9] bg-white/95 text-[#16181C] backdrop-blur-xs"
      }`}
    >
      {children}
    </span>
  );
}
