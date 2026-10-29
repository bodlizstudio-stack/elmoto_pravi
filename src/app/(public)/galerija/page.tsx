import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/photo";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galerija | EL-MOTO d.o.o.",
  description: "Galerija fotografij motornih koles in utrinkov EL-MOTO.",
  alternates: { canonical: "/galerija" },
};

export default async function GalerijaPage() {
  const photos = await prisma.mediaAsset.findMany({
    where: { kind: "gallery", published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="bg-[#F6F6F4] py-10 text-[#16181C] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Galerija" }]} />
        <p className="kicker mt-4">EL-MOTO v sliki</p>
        <h1 className="display mt-2.5 text-5xl text-[#16181C] sm:text-6xl">GALERIJA</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#5B616B]">
          Utrinki iz našega salona, priprave motorjev in predaje strankam.
        </p>

        {photos.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-[14px] border border-[#E2E5E9] bg-white shadow-2xs">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F6F6F4]">
                  <Photo
                    src={photo.url}
                    alt={photo.alt || "Galerija EL-MOTO"}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                {photo.alt ? <figcaption className="p-3.5 text-sm text-[#5B616B]">{photo.alt}</figcaption> : null}
              </figure>
            ))}
          </div>
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
