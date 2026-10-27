import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/photo";
import { prisma } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "O nas | EL-MOTO d.o.o.",
  description:
    "Pri EL-MOTO verjamemo, da je motor več kot le prevozno sredstvo — je svoboda in strast do vožnje. Rabljena motorna kolesa z garancijo, nova motorna kolesa KOVE, uvoz po naročilu, komisijska prodaja, odkup, menjava in najem.",
  alternates: { canonical: "/o-nas" },
};

const services = [
  {
    title: "Prodaja motornih koles",
    text: "Skrbno izbrana rabljena motorna kolesa različnih znamk z garancijo ter nova motorna kolesa znamke KOVE.",
    href: "/motorji",
  },
  {
    title: "Uvoz po naročilu",
    text: "Iščeš točno določen model? Pomagamo ti poiskati, preveriti in uvoziti motor po tvojih željah.",
    href: "/uvoz",
  },
  {
    title: "Komisijska prodaja",
    text: "Svoj motor prepustiš nam, mi pa poskrbimo za celoten postopek predstavitve in varne prodaje.",
    href: "/kontakt?vrsta=OTHER&model=Komisijska%20prodaja",
  },
  {
    title: "Odkup in menjava",
    text: "Zamenjaj svoj trenutni motor za drugega — nudimo možnost odkupa oziroma doplačila ob menjavi za novega ali drugega rabljenega.",
    href: "/kontakt?vrsta=OTHER&model=Odkup%20in%20menjava",
  },
  {
    title: "Najem in preizkus motorjev KOVE",
    text: "Pred nakupom najemi motor KOVE in v praksi preveri, kako ti ustreza, ali pa si ga privošči zgolj za užitek v vožnji.",
    href: "/najem",
  },
  {
    title: "Podaljšano jamstvo in financiranje",
    text: "Podaljšano jamstvo Bike PROTECTION by CarGarantie ter prilagodljive možnosti financiranja Leanpay, NLB Buy&Go in NLB Lease&Go.",
    href: "/garancija-financiranje",
  },
];

const financingAndWarranty = [
  {
    title: "Leanpay",
    role: "Hitro obročno plačilo",
    text: "Enostavno in hitro obročno odplačevanje do 12.000 EUR na do 84 obrokov s fiksno obrestno mero, brez obiska banke.",
  },
  {
    title: "NLB Buy&Go",
    role: "Kredit na prodajnem mestu",
    text: "Prilagodljivo obročno financiranje za nakup novega ali rabljenega motornega kolesa do 15.000 EUR in do 84 mesečnih obrokov.",
  },
  {
    title: "NLB Lease&Go",
    role: "Finančni lizing",
    text: "Lizing rešitev za motorna kolesa z ugodnimi pogoji odplačevanja in prilagodljivo dobo financiranja.",
  },
  {
    title: "Bike PROTECTION by CarGarantie",
    role: "Podaljšano jamstvo",
    text: "Kritje stroškov popravil (delo in material z originalnimi nadomestnimi deli) za nova in rabljena motorna kolesa z veljavnostjo po vsej Evropi.",
  },
];

export default async function AboutPage() {
  const photos = await prisma.mediaAsset.findMany({
    where: { kind: { in: ["about", "gallery"] }, published: true },
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    take: 2,
  });

  return (
    <section className="bg-[#111216] py-10 text-[#F5F5F5] sm:py-14">
      <div className="wrap max-w-5xl">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "O nas" }]} />
        <p className="kicker mt-4">EL-MOTO d.o.o. — Tvoja pot, tvoj motor</p>
        <h1 className="display mt-2.5 text-5xl text-white sm:text-7xl">O NAS</h1>

        {/* Glavna vsebina z natančno zahtevanim poudarjanjem (bold samo EL-MOTO in ključna ponudba v srednjem odstavku) */}
        <div className="mt-7 grid gap-5 rounded-[14px] border border-white/10 bg-[#1B1D22] p-6 text-[17px] leading-8 text-[#B9BDC5] sm:p-8">
          <p className="text-xl leading-8 text-[#F5F5F5]">
            Pri <strong className="font-bold text-white">EL-MOTO</strong> verjamemo, da je motor več kot le prevozno sredstvo. Je svoboda, strast do vožnje in želja po odkrivanju novih poti.
          </p>
          <p>
            Naša ponudba združuje skrbno izbrana rabljena motorna kolesa z garancijo različnih znamk ter nova motorna kolesa znamke KOVE, za katero smo pooblaščeni prodajalec.
          </p>
          <p>
            Poleg motornih koles iz naše redne zaloge ti omogočamo tudi{" "}
            <strong className="font-bold text-white">
              uvoz po naročilu, komisijsko prodajo ter odkup in menjavo motorja, motor KOVE pa lahko tudi najameš za preizkus pred nakupom ali užitek v vožnji
            </strong>
            .
          </p>
          <p>
            Za še več brezskrbnosti na cesti so na voljo podaljšano jamstvo pri nakupu novega ali rabljenega motornega kolesa Bike PROTECTION by CarGarantie ter prilagodljive možnosti financiranja prek Leanpay, NLB Buy&amp;Go in NLB Lease&amp;Go.
          </p>
          <p>
            Pri <strong className="font-bold text-white">EL-MOTO</strong> stavimo na kakovost, prilagodljivost in oseben pristop – od prvega vprašanja do končne odločitve. Nahajamo se na naslovu {site.street}, {site.postalCode} {site.city}.
          </p>
        </div>

        {/* Naša ponudba in storitve */}
        <div className="mt-12">
          <p className="kicker">Celovite storitve</p>
          <h2 className="display mt-2 text-3xl text-white sm:text-4xl">NAŠA PONUDBA IN STORITVE</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group flex flex-col justify-between rounded-[14px] border border-white/10 bg-[#25272D] p-5 transition-all hover:-translate-y-0.5 hover:border-[#E31B2B]"
              >
                <div>
                  <h3 className="flex items-center gap-2.5 text-lg font-bold text-[#F5F5F5]">
                    <CheckCircle2 aria-hidden className="h-5 w-5 shrink-0 text-[#E31B2B]" />
                    <span>{service.title}</span>
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-[#B9BDC5]">{service.text}</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E31B2B]">
                  Več o tem
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Financiranje in podaljšano jamstvo (Leanpay, NLB Buy&Go, NLB Lease&Go, Bike PROTECTION by CarGarantie) */}
        <div className="mt-12">
          <p className="kicker">Financiranje in jamstvo</p>
          <h2 className="display mt-2 text-3xl text-white sm:text-4xl">
            FINANCIRANJE IN PODALJŠANO JAMSTVO
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {financingAndWarranty.map((item) => (
              <div
                key={item.title}
                className="flex flex-col justify-between rounded-[14px] border border-white/10 bg-[#25272D] p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E31B2B]">
                      {item.role}
                    </span>
                    {item.title.includes("CarGarantie") ? (
                      <ShieldCheck aria-hidden className="h-5 w-5 text-[#E31B2B]" />
                    ) : (
                      <Wallet aria-hidden className="h-5 w-5 text-[#E31B2B]" />
                    )}
                  </div>
                  <h3 className="display mt-2 text-2xl text-white">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-[#B9BDC5]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link className="btn btn-primary" href="/garancija-financiranje">
              Podrobnosti o garanciji in financiranju
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Fotografije salona / motorjev */}
        {photos.length ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {photos.map((photo) => {
              const frame = (
                <>
                  <span className="relative block aspect-[4/3] overflow-hidden">
                    <Photo src={photo.url} alt={photo.alt || "EL-MOTO"} sizes="(min-width: 640px) 45vw, 100vw" />
                  </span>
                  {photo.alt ? (
                    <span className="block px-4 py-3 text-sm leading-5 text-[#B9BDC5]">{photo.alt}</span>
                  ) : null}
                </>
              );
              return photo.linkUrl?.startsWith("/") ? (
                <Link
                  key={photo.id}
                  href={photo.linkUrl}
                  className="overflow-hidden rounded-[14px] border border-white/10 bg-[#25272D]"
                >
                  {frame}
                </Link>
              ) : (
                <div key={photo.id} className="overflow-hidden rounded-[14px] border border-white/10 bg-[#25272D]">
                  {frame}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
