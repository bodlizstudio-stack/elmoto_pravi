import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bike, MessageCircle, Sparkles } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { Photo } from "@/components/photo";
import { MotoCard } from "@/components/moto-card";
import { MotoEquipmentSection } from "@/components/moto-equipment";
import { ReviewsMarquee } from "@/components/reviews-marquee";
import { prisma } from "@/lib/db";
import { publishedKoveModels } from "@/lib/kove";
import { homeBikes } from "@/lib/motorcycles";
import { partners } from "@/lib/partners";
import { getSettings } from "@/lib/settings";
import { avtoNetUrl, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "EL-MOTO | Novi in rabljeni motorji · KOVE" },
  description: "EL-MOTO prodaja nove in rabljene motorje in je pooblaščeni prodajalec KOVE. Oglej si ponudbo ali pokliči 070 868 600.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "EL-MOTO | Novi in rabljeni motorji · KOVE",
    description: "Novi in rabljeni motorji pri EL-MOTO. Pooblaščeni prodajalec KOVE.",
    url: "/",
    locale: "sl_SI",
    type: "website",
    images: [
      {
        url: "/images/hero/elmoto-panorama.jpg",
        width: 1024,
        height: 512,
        alt: "Predstavitvena panorama motociklov ob jezeru. Ni fotografija salona EL-MOTO.",
      },
    ],
  },
};

export default async function HomePage() {
  const [bikes, settings, instagram, testimonials, kove] = await Promise.all([
    homeBikes(),
    getSettings(),
    prisma.mediaAsset.findMany({ where: { kind: "instagram", published: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }),
    Promise.resolve(publishedKoveModels[0] ?? null),
  ]);

  const extraReviews = testimonials.map((item) => ({
    id: item.id,
    authorName: item.authorName,
    text: item.text,
    rating: item.rating ?? 5,
    source: item.source || "Google",
  }));

  return (
    <>
      <section className="home-hero text-[#171a1f]">
        <div className="home-hero-stage">
          <div className="home-hero-photo-wrap">
            <Image
              src="/images/hero/hero-desktop.webp"
              alt="Predstavitvena panorama motociklov ob jezeru."
              fill
              priority
              sizes="100vw"
              className="home-hero-photo hidden lg:block"
            />
            <Image
              src="/images/hero/hero-mobile.webp"
              alt="Predstavitvena panorama motociklov ob jezeru."
              fill
              priority
              sizes="100vw"
              className="home-hero-photo block lg:hidden"
            />
            <div className="home-hero-fade" aria-hidden="true" />
          </div>
          <div className="wrap home-hero-grid">
            <div className="home-hero-copy">
              <p className="kicker text-[0.78rem] uppercase tracking-[0.08em] sm:text-[0.84rem]">NOVI IN RABLJENI MOTORJI Z GARANCIJO</p>
              <h1 className="home-hero-title display">
                Tvoja pot.
                <br />
                Tvoj motor.
              </h1>
              <p className="mt-4 max-w-[34rem] text-[17px] leading-7 text-[#3a414a]">
                Odkrij skrbno izbrano ponudbo motornih koles za nakup ali najem. Pri EL-MOTO se vsaka dobra zgodba začne na dveh kolesih.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link className="btn btn-primary w-full sm:w-auto" href="/motorji">
                  Oglej si motorje
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
                <Link className="btn btn-secondary w-full sm:w-auto" href="/kove">
                  Spoznaj KOVE
                </Link>
              </div>
              <p className="mt-4 text-sm text-[#3a414a]">
                Potrebuješ pomoč pri izbiri?{" "}
                <a className="font-semibold text-[#171a1f] underline decoration-[#ec2336] decoration-2 underline-offset-4" href={`tel:${site.phoneTel}`}>
                  {site.phoneDisplay}
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className="wrap home-bridge-wrap">
          <nav className="home-bridge" aria-label="Hitre poti">
            <Link href="/motorji?condition=USED">
              <Bike aria-hidden className="h-5 w-5 text-[#ec2336]" />
              <span>
                <strong>Rabljeni motorji</strong>
                <small>Razišči ponudbo</small>
              </span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link href="/motorji?condition=NEW">
              <Sparkles aria-hidden className="h-5 w-5 text-[#ec2336]" />
              <span>
                <strong>Novi motorji</strong>
                <small>Poišči svoj model</small>
              </span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link href="/kontakt">
              <MessageCircle aria-hidden className="h-5 w-5 text-[#ec2336]" />
              <span>
                <strong>Pogovorimo se</strong>
                <small>Pomagamo pri izbiri</small>
              </span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </section>

      <MotoEquipmentSection />

      <ReviewsMarquee extraReviews={extraReviews} />

      <section className="home-section home-offer bg-white text-[#171a1f]" aria-labelledby="izbrani">
        <div className="wrap">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker uppercase tracking-[0.14em]">Izbrano pri EL-MOTO</p>
              <h2 id="izbrani" className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)]">
                Poišči svoj naslednji motor.
              </h2>
            </div>
            <Link className="inline-flex min-h-11 items-center gap-2 font-semibold" href="/motorji">
              Vsi motorji
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          {bikes.length ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bikes.map((bike) => (
                <MotoCard key={bike.id} bike={bike} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[12px] border border-[#e2e5e9] bg-[#f5f6f7] p-6">
              <p className="text-[17px] leading-7">Trenutno ni objavljenih motorjev. Pokliči nas ali preveri ponudbo na Avto.net.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a className="btn btn-primary w-full sm:w-auto" href={`tel:${settings.phoneTel}`}>
                  Pokliči {settings.phoneDisplay}
                </a>
                <ExternalLink href={avtoNetUrl} className="btn btn-secondary w-full sm:w-auto">
                  Ponudba na Avto.net
                </ExternalLink>
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link className="btn btn-primary w-full sm:w-auto" href="/motorji">
              Poglej celotno ponudbo
            </Link>
            <ExternalLink href={avtoNetUrl} className="inline-flex min-h-12 items-center text-[17px] font-semibold underline decoration-[#ec2336] decoration-2 underline-offset-4">
              Ponudba na Avto.net
            </ExternalLink>
          </div>
        </div>
      </section>

      <section className="home-section bg-[#f5f6f7] text-[#171a1f]" aria-labelledby="kove-naslov">
        <div className="wrap grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="kicker">KOVE pri EL-MOTO</p>
            <h2 id="kove-naslov" className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)]">
              Nova pot se začne s KOVE.
            </h2>
            <p className="mt-4 max-w-xl text-[17px] leading-7 text-[#5b616b]">
              Kot pooblaščeni prodajalec KOVE ti pomagamo spoznati modele in izbrati motor za tvoj način vožnje. Za ponudbo in dobavljivost se obrni na nas.
            </p>
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link className="btn btn-primary w-full sm:w-auto" href="/kove">
                Spoznaj KOVE
              </Link>
              <Link className="inline-flex min-h-12 items-center font-semibold underline decoration-[#ec2336] decoration-2 underline-offset-4" href="/kontakt?vrsta=PURCHASE&model=KOVE">
                Pošlji povpraševanje
              </Link>
            </div>
          </div>
          {kove ? (
            <Image
              src={kove.image}
              alt={`Kataloška fotografija modela ${kove.name}. Ni dokaz zaloge EL-MOTO.`}
              width={kove.imageWidth}
              height={kove.imageHeight}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-auto w-full rounded-[12px] border border-[#e2e5e9] bg-white object-contain"
            />
          ) : (
            <p className="text-[17px] leading-7 text-[#5b616b]">Modele KOVE si ogledaš na strani znamke. To ni seznam zaloge.</p>
          )}
        </div>
      </section>

      <section className="home-section bg-white text-[#171a1f]" aria-labelledby="partnerji">
        <div className="wrap">
          <h2 id="partnerji" className="display text-[clamp(1.8rem,3vw,2.6rem)]">
            Pogovorimo se tudi o financiranju.
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#5b616b]">
            Za možnosti financiranja in jamstva pri izbranem motorju nas kontaktiraj.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {partners.map((partner) => {
              const isExternal = partner.href.startsWith("http");
              const content = (
                <>
                  <p className="text-sm font-semibold text-[#5b616b]">{partner.role}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={partner.logo} alt={partner.name} width={partner.width} height={partner.height} className="partner-logo mt-4 transition-transform group-hover:scale-105" />
                  <p className="mt-4 text-[17px] leading-7 text-[#5b616b]">{partner.text}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#ec2336]">
                    {isExternal ? "Odpri kalkulator" : "Več informacij"}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </span>
                </>
              );
              return (
                <li key={partner.name}>
                  {isExternal ? (
                    <ExternalLink
                      href={partner.href}
                      className="group flex h-full flex-col items-center rounded-[12px] border border-[#e2e5e9] bg-white px-6 py-8 text-center transition hover:border-[#171a1f] hover:shadow-md"
                    >
                      {content}
                    </ExternalLink>
                  ) : (
                    <Link
                      href={partner.href}
                      className="group flex h-full flex-col items-center rounded-[12px] border border-[#e2e5e9] bg-white px-6 py-8 text-center transition hover:border-[#171a1f] hover:shadow-md"
                    >
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <Link className="btn btn-primary mt-8 w-full sm:w-auto" href="/garancija-financiranje">
            Garancija in financiranje
          </Link>
        </div>
      </section>

      <section className="home-section bg-[#f5f6f7] text-[#171a1f]" aria-labelledby="pomoc">
        <div className="wrap grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
          <div>
            <h2 id="pomoc" className="display text-[clamp(1.8rem,3vw,2.6rem)]">
              Nisi prepričan, kateri motor je zate?
            </h2>
            <p className="mt-4 max-w-xl text-[17px] leading-7 text-[#5b616b]">
              Povej nam, kako in kje želiš voziti. Pogovorimo se o možnostih in ti pomagamo pri izbiri.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a className="btn btn-primary w-full sm:w-auto" href={`tel:${settings.phoneTel}`}>
                Pokliči nas
              </a>
              <Link className="btn btn-secondary w-full sm:w-auto" href="/kontakt">
                Pošlji povpraševanje
              </Link>
            </div>
          </div>
          <div className="rounded-[12px] border border-[#e2e5e9] bg-white p-5">
            <h3 className="text-xl font-semibold">Bi motor najprej najel?</h3>
            <p className="mt-2 text-[17px] leading-7 text-[#5b616b]">Najem je ločeno povpraševanje. Termini in cene niso potrjeni, dokler se ne dogovorimo.</p>
            <Link className="mt-4 inline-flex min-h-12 items-center font-semibold underline decoration-[#ec2336] decoration-2 underline-offset-4" href="/najem">
              Preveri možnosti najema
            </Link>
          </div>
        </div>
      </section>

      {instagram.length ? (
        <section className="home-section bg-white text-[#171a1f]" aria-labelledby="utrinki">
          <div className="wrap">
            <h2 id="utrinki" className="display text-[clamp(1.8rem,3vw,2.6rem)]">
              Utrinki
            </h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#5b616b]">
              Javne objave s profila {site.instagramHandle}. Niso del prodajne ponudbe in ne potrjujejo današnje zaloge.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {instagram.map((photo) => (
                <ExternalLink key={photo.id} href={photo.linkUrl || settings.instagram} className="overflow-hidden rounded-[12px] border border-[#e2e5e9] bg-white">
                  <span className="relative block aspect-square overflow-hidden">
                    <Photo src={photo.url} alt={photo.alt || "Utrinek EL-MOTO"} sizes="(min-width: 768px) 30vw, 100vw" />
                  </span>
                </ExternalLink>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="home-section bg-[#f5f6f7] text-[#171a1f]">
        <div className="wrap">
          <h2 className="display max-w-3xl text-[clamp(1.8rem,3vw,2.75rem)]">Naslednja vožnja se začne z izbiro.</h2>
          <p className="mt-4 max-w-xl text-[17px] leading-7 text-[#5b616b]">Oglej si ponudbo ali se z nami dogovori za ogled.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-primary w-full sm:w-auto" href="/motorji">
              Oglej si ponudbo
            </Link>
            <a className="btn btn-secondary w-full sm:w-auto" href={`tel:${settings.phoneTel}`}>
              {settings.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
