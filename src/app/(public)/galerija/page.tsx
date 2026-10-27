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
    <div className="bg-[#111216] py-10 text-[#F5F5F5] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Galerija" }]} />
        <p className="kicker mt-4">EL-MOTO v sliki</p>
        <h1 className="display mt-2.5 text-5xl text-white sm:text-6xl">GALERIJA</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#B9BDC5]">
          Utrinki iz našega salona, priprave motorjev in predaje strankam.
        </p>

        {photos.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-[14px] border border-white/10 bg-[#25272D]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#181A1F]">
                  <Photo
                    src={photo.url}
                    alt={photo.alt || "Galerija EL-MOTO"}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                {photo.alt ? <figcaption className="p-3.5 text-sm text-[#B9BDC5]">{photo.alt}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[14px] border border-dashed border-white/20 bg-[#25272D] p-10 text-center">
            <p className="text-lg font-semibold text-white">Fotografije v galeriji bodo dodane kmalu.</p>
            <p className="mt-2 text-sm text-[#B9BDC5]">
              Slike lahko kadarkoli naložiš v administraciji pod zavihkom Urejanje naslovne strani &amp; podatkov.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
