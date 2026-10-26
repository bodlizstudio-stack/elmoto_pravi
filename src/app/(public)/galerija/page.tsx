import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/photo";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galerija | EL-MOTO",
  description: "Galerija fotografij motornih koles in utrinkov EL-MOTO.",
  alternates: { canonical: "/galerija" },
};

export default async function GalerijaPage() {
  const photos = await prisma.mediaAsset.findMany({
    where: { kind: "gallery", published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="bg-white py-10 text-[#171a1f] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Galerija" }]} />
        <p className="kicker mt-4 uppercase tracking-[0.12em]">EL-MOTO v sliki</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Galerija</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#5b616b]">
          Utrinki iz našega salona, priprave motorjev in predaje strankam.
        </p>

        {photos.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-[12px] border border-[#e2e5e9] bg-[#f5f6f7]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Photo src={photo.url} alt={photo.alt || "Galerija EL-MOTO"} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                </div>
                {photo.alt ? <figcaption className="p-3 text-sm text-[#5b616b]">{photo.alt}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[14px] border border-dashed border-[#cfd4dc] bg-[#f7f8f9] p-10 text-center">
            <p className="text-lg font-semibold text-[#171a1f]">Fotografije v galeriji bodo dodane kmalu.</p>
            <p className="mt-2 text-sm text-[#5b616b]">
              Slike lahko kadarkoli naložiš v administraciji pod zavihkom Vsebina.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
