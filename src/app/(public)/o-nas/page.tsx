import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/photo";
import { prisma } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "O nas",
  description: "EL-MOTO v Trzinu prodaja motorna kolesa in sprejema povpraševanja za najem. Špruha 33, 1236 Trzin.",
  alternates: { canonical: "/o-nas" },
};

export default async function AboutPage() {
  const photos = await prisma.mediaAsset.findMany({
    where: { kind: "about", published: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <section className="bg-paper py-8 text-ink sm:py-12">
      <div className="wrap max-w-3xl">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "O nas" }]} />
        <h1 className="display mt-4 text-5xl sm:text-7xl">O nas</h1>
        <div className="mt-6 grid gap-4 text-[17px] leading-8">
          <p>
            {site.brand} prodaja motorna kolesa na naslovu {site.street}, {site.postalCode} {site.city}. Pooblaščeni smo prodajalec motociklov KOVE. Na strani pregledaš objavljeno ponudbo in pošlješ povpraševanje za nakup ali najem.
          </p>
          <p>
            Pri izbiri se pogovoriva o tem, kako in kje boš vozil. V oglasu so podatki, ki jih imamo za posamezno vozilo. Česar v oglasu ni, ne predstavljava kot dejstvo.
          </p>
          <p>
            Ogled urediva po dogovoru. Najem je povpraševanje: termin je potrjen šele, ko ga potrdi {site.brand}. Na strani ni spletnega plačila.
          </p>
          <p>Smo v Trzinu, blizu Ljubljane. Za obisk pokliči ali piši, da se dogovoriva za termin.</p>
        </div>
        {photos.length ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {photos.map((photo) => {
              const frame = (
                <>
                  <span className="relative block aspect-[4/3] overflow-hidden">
                    <Photo src={photo.url} alt={photo.alt || "EL-MOTO"} sizes="(min-width: 640px) 40vw, 100vw" />
                  </span>
                  {photo.alt ? <span className="block px-3 py-3 text-sm leading-5">{photo.alt}</span> : null}
                </>
              );
              return photo.linkUrl?.startsWith("/") ? (
                <Link key={photo.id} href={photo.linkUrl} className="overflow-hidden rounded-2xl bg-white">
                  {frame}
                </Link>
              ) : (
                <div key={photo.id} className="overflow-hidden rounded-2xl bg-white">{frame}</div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
