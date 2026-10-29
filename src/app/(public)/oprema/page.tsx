import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EquipmentView } from "@/components/equipment-view";
import { prisma } from "@/lib/db";
import { avtoNetOpremaUrl, site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { ensureEquipmentSynced } from "@/lib/shared-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moto oprema | EL-MOTO d.o.o.",
  description:
    "Ponudba motoristične opreme, čelad, zaščitnih oblačil in dodatkov pri EL-MOTO d.o.o. Preveri zalogo in ponudbo na Avto.net.",
  alternates: { canonical: "/oprema" },
};

export default async function OpremaPage() {
  await ensureEquipmentSynced();
  const rawItems = await prisma.equipment.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const items = rawItems.map((item) => ({
    id: item.id,
    title: item.title,
    priceCents: item.priceCents,
    formattedPrice: item.priceCents ? formatPrice(item.priceCents, true) : "Cena po dogovoru",
    description: item.description,
    category: item.category,
    imageUrl: item.imageUrl,
    avtonetUrl: item.avtonetUrl,
  }));

  return (
    <div className="bg-[#F6F6F4] py-10 text-[#16181C] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Domov", href: "/" }, { label: "Ponudba", href: "/motorji" }, { label: "Moto oprema" }]} />

        {/* HERO SEKCIJA */}
        <div className="mt-4 max-w-3xl">
          <p className="kicker">Ponudba EL-MOTO</p>
          <h1 className="display mt-2.5 text-4xl text-[#16181C] sm:text-6xl">MOTO OPREMA</h1>
          <p className="mt-4 text-[17px] leading-7 text-[#5B616B]">
            Odkrij kakovostno motoristično opremo, čelade, jakne, hlače, rokavice in zaščitne dodatke priznanih proizvajalcev.
            Klikni na katerikoli artikel za ogled podrobnosti, ali preveri celotno aktualno ponudbo v naši uradni trgovini na portalu Avto.net.
          </p>
        </div>

        {/* BANNER / GLAVNI GUMB ZA AVTO.NET OPREMO */}
        <div className="mt-8 overflow-hidden rounded-[16px] border border-black/10 bg-gradient-to-br from-[#16181c] via-[#1f2328] to-[#16181c] p-6 text-white shadow-md sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-[#E31B2B] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Aktualna ponudba na zalogi
              </span>
              <h2 className="display mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Razišči celotno ponudbo opreme na Avto.net
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
                Vsi kosi opreme, velikosti, tehnične specifikacije in fotografije so zbrani na naši uradni strani Avto.net.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href={avtoNetOpremaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-[#E31B2B]/20"
              >
                <span>Razišči opremo na Avto.net</span>
                <span aria-hidden="true">↗</span>
              </a>
              <Link
                href="/kontakt?vrsta=GENERAL&model=Moto%20oprema#kontaktni-obrazec"
                className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Pošlji povpraševanje
              </Link>
            </div>
          </div>
        </div>

        {/* PRIKAZ IZDELKOV IZ BAZE */}
        <div className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2E5E9] pb-4">
            <div>
              <h2 className="display text-2xl text-[#16181C] sm:text-3xl">Izbrana ponudba v salonu</h2>
              <p className="mt-1 text-sm text-[#5B616B]">
                {items.length > 0
                  ? `Prikazanih je ${items.length} kosov opreme. Klikni na artikel za ogled podrobnosti ali obišči Avto.net.`
                  : "Za pregled celotne opreme na zalogi kliknite na gumb zgoraj za ogled na portalu Avto.net."}
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <EquipmentView items={items} />
          ) : (
            <div className="mt-8 rounded-[16px] border border-dashed border-[#D0D4DC] bg-white p-8 text-center sm:p-12 shadow-2xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E31B2B]/10 text-[#E31B2B]">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#16181C]">Celotna ponudba je na voljo na Avto.net</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#5B616B]">
                Vso trenutno razpoložljivo moto opremo, kombinezone, čelade in dodatke redno posodabljamo neposredno na portalu Avto.net.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={avtoNetOpremaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  <span>Odpri ponudbo opreme na Avto.net</span>
                  <span>↗</span>
                </a>
                <Link href="/kontakt" className="btn btn-secondary">
                  Kontaktiraj nas
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* INFO KARTICA ZA SALON */}
        <div className="mt-14 rounded-[14px] border border-[#E2E5E9] bg-white p-6 shadow-2xs sm:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="kicker">Svetovanje</p>
              <h3 className="mt-1 text-lg font-bold text-[#16181C]">Osebno preizkušanje v salonu</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5B616B]">
                Vabljeni v naš salon v Trzinu, kjer lahko opremo in čelade v živo preizkusite ter se posvetujete z našimi strokovnjaki.
              </p>
            </div>
            <div>
              <p className="kicker">Lokacija</p>
              <h3 className="mt-1 text-lg font-bold text-[#16181C]">{site.street}, {site.postalCode} {site.city}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5B616B]">
                Odprto po dogovoru. Pred prihodom nas lahko kontaktirate, da vam pripravimo želene artikle za ogled.
              </p>
            </div>
            <div>
              <p className="kicker">Hitri kontakt</p>
              <h3 className="mt-1 text-lg font-bold text-[#16181C]">{site.email}</h3>
              <div className="mt-4">
                <Link href="/kontakt#kontaktni-obrazec" className="btn btn-secondary text-xs">
                  Piši nam preko obrazca →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
