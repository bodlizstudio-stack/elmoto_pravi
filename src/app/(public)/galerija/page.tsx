import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { prisma } from "@/lib/db";
import { ensureMediaSynced } from "@/lib/shared-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galerija | EL-MOTO d.o.o.",
  description: "Galerija fotografij motornih koles in utrinkov EL-MOTO.",
  alternates: { canonical: "/galerija" },
};

export default async function GalerijaPage() {
  await ensureMediaSynced();
  const rawPhotos = await prisma.mediaAsset.findMany({
    where: { kind: "gallery", published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const photos = rawPhotos.map((p) => ({
    id: p.id,
    url: p.url,
    alt: p.alt || "Galerija EL-MOTO",
  }));

  return (
    <div className="bg-[#F6F6F4] py-10 text-[#16181C] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Galerija" }]} />
        <p className="kicker mt-4">EL-MOTO v sliki</p>
        <h1 className="display mt-2.5 text-5xl text-[#16181C] sm:text-6xl">GALERIJA</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#5B616B]">
          Utrinki iz našega salona, priprave motorjev in predaje strankam. Klikni na katerokoli sliko za povečavo in listanje s puščicami.
        </p>

        {photos.length > 0 ? (
          <GalleryLightbox photos={photos} />
        ) : (
          <div className="mt-8 rounded-[14px] border border-dashed border-[#D0D4DC] bg-white p-10 text-center shadow-2xs">
            <p className="text-lg font-semibold text-[#16181C]">Fotografije v galeriji bodo dodane kmalu.</p>
            <p className="mt-2 text-sm text-[#5B616B]">
              Slike lahko kadarkoli naložiš v administraciji pod zavihkom Galerija.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
