import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { prisma } from "@/lib/db";
import { publicationLabel } from "@/lib/offer";
import { ensureDbSynced } from "@/lib/shared-store";
import { conditionLabel, displayName, formatCc, formatKm, formatPower, formatPrice, lines, stockLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureDbSynced();
  const { id } = await params;
  const bike = await prisma.motorcycle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!bike) notFound();
  const name = displayName(bike);
  const rows = [
    ["Znamka", bike.brand],
    ["Model", bike.model],
    ["Letnik", bike.year ? String(bike.year) : ""],
    ["Stanje", conditionLabel(bike.condition)],
    ["Kilometri", formatKm(bike.mileageKm) || ""],
    ["Prostornina", formatCc(bike.engineCc) || ""],
    ["Moč", formatPower(bike.powerKw, bike.powerHp) || ""],
    ["Razpoložljivost", stockLabel(bike.status)],
  ].filter(([, value]) => value);
  return (
    <div className="grid gap-6">
      <p className="border border-accent/40 bg-white p-4 leading-7" role="status">
        To je predogled. {publicationLabel(bike.publication) === "Objavljeno" ? "Motor je objavljen tudi za obiskovalce." : "Ta različica ni javna."}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link className="btn btn-secondary" href={`/admin/motorji/${bike.id}`}>
          Nazaj na urejanje
        </Link>
        <Link className="btn btn-secondary" href="/admin">
          Nazaj na ponudbo
        </Link>
      </div>
      <article className="grid gap-6 rounded-[12px] border border-black/10 bg-white p-4 sm:p-5 lg:grid-cols-2">
        <Gallery images={bike.images.map((image) => ({ url: image.url, alt: image.alt || name }))} title={name} />
        <div>
          <h1 className="text-3xl font-semibold">{name}</h1>
          <p className="mt-3 text-2xl font-semibold">{formatPrice(bike.priceCents, bike.priceConfirmed)}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-ink/50">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {bike.cardSummary ? <p className="mt-4 leading-7">{bike.cardSummary}</p> : null}
          {bike.description ? <p className="prose-copy mt-4">{bike.description}</p> : null}
          {lines(bike.equipment).length ? (
            <ul className="mt-4 list-disc pl-5">
              {lines(bike.equipment).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </div>
  );
}
