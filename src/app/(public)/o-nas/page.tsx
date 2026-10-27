import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/photo";
import { prisma } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "O nas | EL-MOTO",
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
    text: "Za še več brezskrbnosti so na voljo podaljšano jamstvo Bike PROTECTION by CarGarantie ter prilagodljive možnosti financiranja Leanpay in NLB Buy&Go.",
    href: "/garancija-financiranje",
  },
];

export default async function AboutPage() {
  const photos = await prisma.mediaAsset.findMany({
    where: { kind: "about", published: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <section className="bg-paper py-8 text-ink sm:py-12">
      <div className="wrap max-w-4xl">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "O nas" }]} />
        <p className="kicker mt-4 uppercase tracking-[0.12em]">EL-MOTO — Tvoja pot, tvoj motor</p>
        <h1 className="display mt-2 text-5xl sm:text-7xl">O nas</h1>
        <div className="mt-6 grid gap-4 text-[17px] leading-8">
          <p className="text-xl font-medium text-ink">
            Pri EL-MOTO verjamemo, da je motor več kot le prevozno sredstvo. Je svoboda, strast do vožnje in želja po odkrivanju novih poti.
          </p>
          <p>
            Naša ponudba združuje skrbno izbrana rabljena motorna kolesa z garancijo različnih znamk ter nova motorna kolesa znamke <strong>KOVE</strong>, za katero smo pooblaščeni prodajalec.
          </p>
          <p>
            Poleg motornih koles iz naše redne zaloge ti omogočamo tudi <strong>uvoz po naročilu</strong>, <strong>komisijsko prodajo</strong> ter <strong>odkup in menjavo</strong> tvojega obstoječega motorja.
          </p>
          <p>
            Motor KOVE pa lahko pri nas tudi <strong>najameš</strong> – bodisi za preizkus pred nakupom, da v praksi preveriš, kateri model ti najbolj ustreza, bodisi preprosto za užitek v vožnji.
          </p>
          <p>
            Za še več brezskrbnosti na cesti so na voljo možnost podaljšanja jamstva pri nakupu novega ali rabljenega motornega kolesa (<strong>Bike PROTECTION by CarGarantie</strong>) in prilagodljive možnosti financiranja (<strong>Leanpay</strong> ter <strong>NLB Buy&amp;Go</strong>).
          </p>
          <p>
            Pri EL-MOTO stavimo na kakovost, prilagodljivost in oseben pristop – od prvega vprašanja do končne odločitve. Nahajamo se na naslovu {site.street}, {site.postalCode} {site.city}.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="display text-3xl sm:text-4xl">Naša ponudba in storitve</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group flex flex-col justify-between rounded-[14px] border border-black/10 bg-white p-5 transition hover:border-ink hover:shadow-sm"
              >
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
                    <CheckCircle2 aria-hidden className="h-5 w-5 shrink-0 text-[#ec2336]" />
                    <span>{service.title}</span>
                  </h3>
                  <p className="mt-2 text-[15px] leading-6 text-ink/75">{service.text}</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#ec2336]">
                  Več o tem
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {photos.length ? (
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
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
